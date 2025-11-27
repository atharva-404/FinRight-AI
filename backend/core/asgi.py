"""
ASGI config for core project.

This file routes WebSocket connections for chat to a simple in-app handler
(`ai_assistant.ws.chat_app`) and routes all other protocols to Django's
ASGI application. For production use, run under Daphne or Uvicorn.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Import the simple chat_app defined in ai_assistant/ws.py
django_asgi_app = get_asgi_application()


async def application(scope, receive, send):
	"""Route websocket requests for /ws/chat/ to the chat_app, others to Django.

	Import `chat_app` lazily to avoid importing Django models before the
	app registry is ready (which would raise `AppRegistryNotReady`).
	"""
	if scope["type"] == "websocket" and scope.get("path", "").startswith("/ws/chat/"):
		# Import here so Django has time to initialize before models are imported
		from ai_assistant.ws import chat_app
		await chat_app(scope, receive, send)
	else:
		await django_asgi_app(scope, receive, send)
