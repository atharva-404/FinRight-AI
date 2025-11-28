# socket/routing.py
from django.urls import re_path
from .consumers import ExpenseChatConsumer

websocket_urlpatterns = [
    re_path(r"ws/ai/chat/(?P<mongo_id>[^/]+)/$", ExpenseChatConsumer.as_asgi()),
]
