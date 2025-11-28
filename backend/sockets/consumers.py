# socket/consumers.py
import asyncio
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from asgiref.sync import sync_to_async

from ai_assistant.services.expense_extraction import get_expense_document_by_id
from ai_assistant.services.expense_chat import chat_with_expense_data
from .models import ChatSession, ChatMessage


class ExpenseChatConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket endpoint for AI chat over expenses, with:
    - Room per mongo_id (multiple clients see same answer)
    - Typing indicator
    - Streaming-style chunks
    - History saved in DB

    URL: ws://<host>/ws/ai/chat/<mongo_id>/
    """

    async def connect(self):
        user = self.scope.get("user")
        if user is None or user.is_anonymous:
            await self.close()
            return

        self.mongo_id = self.scope["url_route"]["kwargs"]["mongo_id"]
        self.room_group_name = f"expense_chat_{self.mongo_id}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        """
        Expected payload:
        {
          "question": "How much did I spend on food last month?"
        }
        """
        user = self.scope["user"]
        question = content.get("question")
        if not question:
            await self.send_json({"type": "error", "error": "question is required"})
            return

        # 1) Ensure ChatSession exists (per user + mongo_id)
        session = await sync_to_async(self._get_or_create_session)(user, self.mongo_id)

        # 2) Save user message
        await sync_to_async(ChatMessage.objects.create)(
            session=session, sender="user", text=question
        )

        # 3) Notify room that AI is typing
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.typing",
                "mongo_id": self.mongo_id,
                "sender": "ai",
                "status": "start",
            },
        )

        # 4) Get Mongo doc & LLM answer (blocking → thread)
        doc = await sync_to_async(get_expense_document_by_id)(self.mongo_id)
        if not doc:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat.message",
                    "payload": {
                        "type": "error",
                        "error": "Document not found",
                        "mongo_id": self.mongo_id,
                    },
                },
            )
            return

        answer = await sync_to_async(chat_with_expense_data)(question, doc)

        # 5) Save AI message
        await sync_to_async(ChatMessage.objects.create)(
            session=session, sender="ai", text=answer
        )

        # 6) Fake stream: chunk answer into small pieces
        chunk_size = 40
        for i in range(0, len(answer), chunk_size):
            chunk = answer[i : i + chunk_size]
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat.message",
                    "payload": {
                        "type": "chunk",
                        "mongo_id": self.mongo_id,
                        "text": chunk,
                    },
                },
            )
            # yield control to event loop
            await asyncio.sleep(0)

        # 7) Typing stopped + done event
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.typing",
                "mongo_id": self.mongo_id,
                "sender": "ai",
                "status": "stop",
            },
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.message",
                "payload": {
                    "type": "done",
                    "mongo_id": self.mongo_id,
                    "complete": answer,
                },
            },
        )

    # === group handlers ===

    async def chat_message(self, event):
        # event["payload"] is already JSON-serializable
        await self.send_json(event["payload"])

    async def chat_typing(self, event):
        await self.send_json(
            {
                "type": "typing",
                "mongo_id": event.get("mongo_id"),
                "sender": event.get("sender"),
                "status": event.get("status"),  # "start" | "stop"
            }
        )

    # === helper ===

    def _get_or_create_session(self, user, mongo_id):
        session, _ = ChatSession.objects.get_or_create(
            user=user,
            mongo_id=mongo_id,
        )
        return session
