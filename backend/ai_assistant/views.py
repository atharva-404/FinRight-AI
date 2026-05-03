# ai_assistant/views.py
from rest_framework.views import APIView
import rest_framework.generics as generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated

from .models import ChatMessage, ChatSession, Document
from .serializers import ChatMessageSerializer, ChatSessionSerializer, DocumentSerializer, DocumentListSerializer
from .services.expense_extraction import (
    extract_text_from_uploaded_file,
    call_llm_for_expense_extraction,
    save_expense_document_to_mongo,
    get_expense_document_by_id,
)
from .services.expense_summary import summarize_expenses_from_data

import json
from collections import defaultdict


class DocumentProcessAPIView(APIView):
    """
    POST /api/ai/document/process/

    Upload file -> extract text -> store SQL -> extract structured data using LLM
    -> save structured JSON to Mongo -> generate LLM summary -> return insights.
    """

    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        # STEP 1: Extract raw text
        try:
            raw_text = extract_text_from_uploaded_file(uploaded_file)
        except Exception as e:
            return Response({"error": "Text extraction failed", "details": str(e)}, status=500)

        # STEP 2: Save raw text in SQL Document model
        document = Document.objects.create(
            user=request.user,
            file_name=uploaded_file.name,
            content=raw_text,
        )

        # STEP 3: Run LLM structured extraction
        try:
            structured_data = call_llm_for_expense_extraction(raw_text)
        except Exception as e:
            return Response({"error": "LLM extraction failed", "details": str(e)}, status=500)

        # STEP 4: Save structured JSON to Mongo
        try:
            mongo_id = save_expense_document_to_mongo(
                user_id=request.user.id,
                uploaded_file=uploaded_file,
                raw_text=raw_text,
                structured_data=structured_data
            )
        except Exception as e:
            return Response({"error": "MongoDB save failed", "details": str(e)}, status=500)

        # STEP 5: Summary using structured JSON + LLM summary generation
        try:
            summary_data = summarize_expenses_from_data(structured_data)
        except Exception as e:
            summary_data = {"error": f"Summary generation failed: {str(e)}"}

        return Response(
            {
                "message": "Processed successfully",
                "sql_document_id": document.id,
                "mongo_id": mongo_id,
                "summary": summary_data,
            },
            status=status.HTTP_201_CREATED,
        )


class DocumentListAPIView(APIView):
    """GET /api/ai/documents/  -> list documents stored in SQL"""

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        docs = Document.objects.filter(user=request.user).order_by("-created_at")
        serializer = DocumentListSerializer(docs, many=True)
        return Response(serializer.data)


class DocumentContentAPIView(APIView):
    """GET /api/ai/documents/<document_id>/content/ -> return extracted raw text"""

    permission_classes = [IsAuthenticated]

    def get(self, request, document_id, *args, **kwargs):
        try:
            doc = Document.objects.get(id=document_id, user=request.user)
        except Document.DoesNotExist:
            return Response({"error": "Document not found"}, status=404)

        serializer = DocumentSerializer(doc)
        return Response(serializer.data)


class ExpenseDocumentSummaryAPIView(APIView):
    """GET /api/ai/expense-document/<mongo_doc_id>/summary/"""

    permission_classes = [IsAuthenticated]

    def get(self, request, doc_id, *args, **kwargs):
        doc = get_expense_document_by_id(doc_id)
        if not doc:
            return Response({"error": "Document not found"}, status=404)

        extracted = doc.get("extracted_data") or {}
        if isinstance(extracted, str):
            try:
                extracted = json.loads(extracted)
            except:
                extracted = {}

        expenses = extracted.get("expenses", [])
        llm_summary = extracted.get("summary", {})

        total_amount = 0.0
        record_count = 0
        currency = llm_summary.get("currency")

        category_totals = defaultdict(lambda: {"total": 0.0, "count": 0})
        merchant_totals = defaultdict(lambda: {"total": 0.0, "count": 0})

        for e in expenses:
            try:
                amount = float(e.get("amount"))
            except:
                continue

            total_amount += amount
            record_count += 1

            category = e.get("category") or "Uncategorized"
            merchant = e.get("merchant") or "Unknown"

            category_totals[category]["total"] += amount
            category_totals[category]["count"] += 1
            merchant_totals[merchant]["total"] += amount
            merchant_totals[merchant]["count"] += 1

        by_category = sorted(
            [{"category": k, "total_amount": v["total"], "count": v["count"]}
             for k, v in category_totals.items()],
            key=lambda x: x["total_amount"],
            reverse=True,
        )

        by_merchant = sorted(
            [{"merchant": k, "total_amount": v["total"], "count": v["count"]}
             for k, v in merchant_totals.items()],
            key=lambda x: x["total_amount"],
            reverse=True,
        )[:10]

        return Response(
            {
                "mongo_id": doc_id,
                "summary": llm_summary,
                "computed": {
                    "total_amount": round(total_amount, 2),
                    "record_count": record_count,
                    "currency": currency,
                    "average": round(total_amount / record_count, 2) if record_count else None,
                },
                "breakdown": {
                    "by_category": by_category,
                    "by_merchant": by_merchant,
                },
            },
            status=200,
        )


class ExpenseSuggestionAPIView(APIView):
    """
    GET /api/ai/expense-document/<mongo_id>/suggestions/
    
    Generate actionable saving suggestions based on spending patterns.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, mongo_id, *args, **kwargs):
        # Fetch expense structured data from MongoDB
        doc = get_expense_document_by_id(mongo_id)
        if not doc:
            return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)

        extracted = doc.get("extracted_data") or {}
        if isinstance(extracted, str):
            try:
                extracted = json.loads(extracted)
            except:
                extracted = {}

        from .services.expense_suggestions import generate_saving_suggestions

        suggestions = generate_saving_suggestions(extracted)

        return Response(
            {
                "mongo_id": mongo_id,
                "suggestions": suggestions.get("suggestions", []),
            },
            status=200,
        )




class ChatSessionListAPIView(generics.ListAPIView):
    """
    GET /api/socket/chat-sessions/
    List user's chat sessions (paginated).
    """
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user).order_by("-created_at")


class ChatMessageListAPIView(generics.ListAPIView):
    """
    GET /api/socket/chat-sessions/<session_id>/messages/
    Paginated messages within a session.
    """
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        session_id = self.kwargs["session_id"]
        return ChatMessage.objects.filter(
            session__id=session_id,
            session__user=self.request.user,
        ).order_by("-created_at")