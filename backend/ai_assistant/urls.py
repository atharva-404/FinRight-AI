# ai_assistant/urls.py
from django.urls import path
from .views import (
    ExpenseUploadAPIView,
    ExpenseDocumentTableAPIView,
    DocumentListAPIView,
    DocumentContentAPIView,
    DocumentUploadAPIView,
    ConversationCreateAPIView,
    ConversationListAPIView,
)

urlpatterns = [
    path("expense-upload/", ExpenseUploadAPIView.as_view(), name="expense-upload"),
    path("expense-document/<str:doc_id>/table/", ExpenseDocumentTableAPIView.as_view(), name="expense-document-table"),

    # Document management
    path("documents/", DocumentListAPIView.as_view(), name="document-list"),
    path("documents/upload/", DocumentUploadAPIView.as_view(), name="document-upload"),
    path("documents/<int:document_id>/content/", DocumentContentAPIView.as_view(), name="document-content"),

    # Conversations
    path("conversations/", ConversationListAPIView.as_view(), name="conversation-list"),
    path("conversations/create/", ConversationCreateAPIView.as_view(), name="conversation-create"),
]
