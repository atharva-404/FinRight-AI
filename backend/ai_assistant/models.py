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


class Conversation(models.Model):
	"""A conversation thread optionally linked to a Document."""
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
	document = models.ForeignKey(Document, on_delete=models.SET_NULL, null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	last_updated = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"Conversation({self.id}, user={self.user_id})"


class Message(models.Model):
	"""A chat message within a Conversation."""
	conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
	text = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Message({self.id}, conv={self.conversation_id}, user={self.user_id})"

