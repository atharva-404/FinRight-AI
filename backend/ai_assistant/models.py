# ai_assistant/models.py
from django.db import models
from django.conf import settings


class Document(models.Model):
    """Represents an uploaded document and its extracted text."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    file_name = models.CharField(max_length=512)
    content = models.TextField(blank=True)  # extracted text
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Document({self.id}, {self.file_name})"



class ChatSession(models.Model):
    """
    A chat session tied to a user and optionally to a Mongo expense document.
    Multiple clients (tabs/devices) can connect to the same session via WebSocket room.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    mongo_id = models.CharField(max_length=64, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ChatSession({self.id}, user={self.user_id}, mongo={self.mongo_id})"


class ChatMessage(models.Model):
    """
    A single chat message stored in the session history.
    """
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=10, choices=[("user", "user"), ("ai", "ai")])
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"ChatMessage({self.id}, session={self.session_id}, sender={self.sender})"	
    
	