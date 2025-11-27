
# ai_assistant/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from .serializers import ExpenseFileUploadSerializer
from .services.expense_extraction import (
    extract_text_from_uploaded_file,
    call_llm_for_expense_extraction,
    save_expense_document_to_mongo,
    get_expense_document_by_id,
    extracted_data_to_csv_bytes,
)
from django.http import HttpResponse
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import (
    DocumentSerializer,
    DocumentListSerializer,
    ConversationSerializer,
    MessageSerializer,
)
from .models import Document, Conversation, Message
from asgiref.sync import sync_to_async


class ExpenseUploadAPIView(APIView):
    """
    POST /api/ai/expense-upload/
    
    Upload a file (PDF, image, CSV, TXT) to extract expenses using LLM.
    The extracted expenses are saved to MongoDB.
    
    Request:
        - Content-Type: multipart/form-data
        - file: The file to upload (PDF, JPG, PNG, CSV, TXT)
    
    Response:
        {
            "message": "File processed and stored successfully.",
            "mongo_id": "507f1f77bcf86cd799439011",
            "extracted_data": {
                "expenses": [...],
                "summary": {...}
            }
        }
    """

    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        serializer = ExpenseFileUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "error": "Invalid input",
                    "details": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        uploaded_file = serializer.validated_data["file"]

        # 1) Extract text from file
        try:
            raw_text = extract_text_from_uploaded_file(uploaded_file)
            if not raw_text or not raw_text.strip():
                return Response(
                    {
                        "error": "No text extracted",
                        "details": "Could not extract any text from the uploaded file."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as e:
            return Response(
                {
                    "error": "Text extraction failed",
                    "details": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # 2) LLM -> structured JSON
        try:
            structured_data = call_llm_for_expense_extraction(raw_text)
        except Exception as e:
            return Response(
                {
                    "error": "LLM extraction failed",
                    "details": f"Error while calling OpenAI: {str(e)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # 3) Save in MongoDB as key-value document
        try:
            user_id = request.user.id if request.user and request.user.is_authenticated else None
            mongo_id = save_expense_document_to_mongo(
                user_id=user_id,
                uploaded_file=uploaded_file,
                raw_text=raw_text,
                structured_data=structured_data,
            )
        except Exception as e:
            return Response(
                {
                    "error": "MongoDB save failed",
                    "details": f"Error while saving to MongoDB: {str(e)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "message": "File processed and stored successfully.",
                "mongo_id": mongo_id,
                "file_name": uploaded_file.name,
                "file_size": uploaded_file.size,
                "extracted_data": structured_data,
            },
            status=status.HTTP_201_CREATED,
        )


class ExpenseDocumentTableAPIView(APIView):
    """
    GET /api/ai/expense-document/<doc_id>/table/?format=csv|json

    Returns the extracted expenses for a stored document in tabular format.
    By default returns CSV for easy download. Use `?format=json` to get JSON.
    """

    permission_classes = [AllowAny]

    def get(self, request, doc_id, *args, **kwargs):
        # Fetch document from MongoDB
        doc = get_expense_document_by_id(doc_id)
        if not doc:
            return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)

        extracted = doc.get("extracted_data") or {}

        out_format = request.query_params.get("format", "csv").lower()

        if out_format == "json":
            # Return the extracted data as JSON (tabular-like structure)
            return Response({
                "mongo_id": str(doc.get("_id")),
                "file_name": doc.get("file_name"),
                "extracted_data": extracted,
            })

        # Default: return CSV file
        try:
            csv_bytes = extracted_data_to_csv_bytes(extracted)
            filename = f"document_{doc_id}.csv"
            response = HttpResponse(csv_bytes, content_type="text/csv; charset=utf-8")
            response["Content-Disposition"] = f'attachment; filename="{filename}"'
            return response
        except Exception as e:
            return Response({"error": "Failed to generate CSV", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DocumentListAPIView(APIView):
    """GET /api/documents -> list documents for authenticated user"""

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        docs = Document.objects.filter(user=request.user).order_by("-created_at")
        serializer = DocumentListSerializer(docs, many=True)
        return Response(serializer.data)


class DocumentContentAPIView(APIView):
    """GET /api/documents/{document_id}/content -> return extracted text"""

    permission_classes = [IsAuthenticated]

    def get(self, request, document_id, *args, **kwargs):
        try:
            doc = Document.objects.get(id=document_id, user=request.user)
        except Document.DoesNotExist:
            return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = DocumentSerializer(doc)
        return Response(serializer.data)


class DocumentUploadAPIView(APIView):
    """POST /api/documents -> upload a file, extract text and save Document"""

    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        serializer = ExpenseFileUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = serializer.validated_data["file"]

        # Extract text
        try:
            raw_text = extract_text_from_uploaded_file(uploaded_file)
        except Exception as e:
            return Response({"error": "Text extraction failed", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Save document in Django DB
        doc = Document.objects.create(user=request.user, file_name=uploaded_file.name, content=raw_text)
        doc_serializer = DocumentSerializer(doc)
        return Response(doc_serializer.data, status=status.HTTP_201_CREATED)


class ConversationCreateAPIView(APIView):
    """POST /api/conversations -> create conversation linked to user and optional document_id"""

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        doc_id = request.data.get("document_id")
        document = None
        if doc_id:
            try:
                document = Document.objects.get(id=doc_id, user=request.user)
            except Document.DoesNotExist:
                return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)

        conv = Conversation.objects.create(user=request.user, document=document)
        serializer = ConversationSerializer(conv)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ConversationListAPIView(APIView):
    """GET /api/conversations -> list conversations for authenticated user"""

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        convs = Conversation.objects.filter(user=request.user).order_by("-last_updated")
        data = [
            {
                "conversation_id": c.id,
                "document_id": c.document.id if c.document else None,
                "last_updated": c.last_updated,
            }
            for c in convs
        ]
        return Response(data)

