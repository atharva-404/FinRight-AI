 # ai_assistant/services/document_chat.py
"""
Service for AI chat with SQL document content.
Fetches document content and generates short, professional 2-line responses.
"""
from typing import Optional, List
from openai import OpenAI
from django.db import models

client = OpenAI()


def fetch_documents_content(user_id: int, document_id: Optional[int] = None) -> str:
    """
    Fetch document content from SQL database.
    
    Args:
        user_id: The user ID to filter documents
        document_id: Specific document ID. If None, fetch all user documents.
    
    Returns:
        Combined document content as string
    """
    from ai_assistant.models import Document
    
    if document_id:
        try:
            doc = Document.objects.get(id=document_id, user_id=user_id)
            return doc.content or ""
        except Document.DoesNotExist:
            return ""
    else:
        # Fetch all documents for user
        docs = Document.objects.filter(user_id=user_id).order_by("-created_at")
        contents = [f"--- {doc.file_name} ---\n{doc.content}" for doc in docs if doc.content]
        return "\n\n".join(contents)


def chat_with_document(
    question: str,
    user_id: int,
    document_id: Optional[int] = None
) -> str:
    """
    Generate a short, professional 2-line response using document context.
    
    Args:
        question: User's question
        user_id: User ID to filter documents
        document_id: Optional specific document ID. If None, uses all documents.
    
    Returns:
        Short, professional 2-line response
    """
    # Fetch document content
    content = fetch_documents_content(user_id, document_id)
    
    if not content.strip():
        return "No document content available. Please upload a document first."
    
    system_prompt = """You are a professional financial assistant.
Answer ONLY in exactly 2 lines, clear and concise.
Be specific with data from the document when possible.
Tone: Professional, helpful, and accurate.
If data is insufficient, briefly state what's missing."""

    user_message = f"""Document content:
{content}

Question: {question}

Provide a short, professional 2-line answer."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        temperature=0.4,
        max_tokens=150,
    )
    
    answer = response.choices[0].message.content.strip()
    return answer
