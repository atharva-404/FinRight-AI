# ai_assistant/urls.py
from django.urls import path
from .views import (
    ChatMessageListAPIView,
    ChatSessionListAPIView,
    DocumentProcessAPIView,
    DocumentListAPIView,
    DocumentContentAPIView,
    ExpenseDocumentSummaryAPIView,
    ExpenseSuggestionAPIView,
)

urlpatterns = [
    # Upload + extract text + store SQL + store structured Mongo + generate summary
    path("document/process/", DocumentProcessAPIView.as_view(), name="document-process"),

    # Document management (SQL)
    path("documents/", DocumentListAPIView.as_view(), name="document-list"),
    path("documents/<int:document_id>/content/", DocumentContentAPIView.as_view(), name="document-content"),

    # Summary and breakdown from Mongo + LLM
    path("expense-document/<str:doc_id>/summary/", ExpenseDocumentSummaryAPIView.as_view(), name="expense-document-summary"),
    path("expense-document/<str:mongo_id>/suggestions/", ExpenseSuggestionAPIView.as_view(), name="expense-document-suggestions"),

    path("chat-sessions/", ChatSessionListAPIView.as_view(), name="chat-session-list"),
    path("chat-sessions/<int:session_id>/messages/", ChatMessageListAPIView.as_view(), name="chat-message-list"),

]
