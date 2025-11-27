# ai_assistant/serializers.py
from rest_framework import serializers
from .models import Document, Conversation, Message


class ExpenseFileUploadSerializer(serializers.Serializer):
    """
    Serializer for uploading bank statements/receipts/invoices.
    Supports: PDF, images (JPG, PNG, etc.), CSV, TXT
    """
    file = serializers.FileField(
        help_text="Upload a file (PDF, image, CSV, or TXT)"
    )

    def validate_file(self, file):
        """
        Validate file size and format.
        """
        # Max 10MB
        max_size = 10 * 1024 * 1024
        if file.size > max_size:
            raise serializers.ValidationError(
                f"File size must not exceed 10MB. Got {file.size / (1024*1024):.2f}MB"
            )

        # Allowed extensions
        allowed_extensions = {
            '.pdf', '.txt', '.csv',
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'
        }
        
        file_name_lower = file.name.lower()
        file_ext = None
        for ext in allowed_extensions:
            if file_name_lower.endswith(ext):
                file_ext = ext
                break

        if not file_ext:
            raise serializers.ValidationError(
                f"File type not supported. Allowed: {', '.join(allowed_extensions)}"
            )

        return file


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["id", "file_name", "content", "created_at"]


class DocumentListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["id", "file_name", "created_at"]


class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = ["id", "user", "document", "created_at", "last_updated"]


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "conversation", "user", "text", "created_at"]
