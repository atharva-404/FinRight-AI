# socket/routing.py
from django.urls import re_path


def get_websocket_urlpatterns():
    """Lazy import to avoid loading models before Django is initialized."""
    from .consumers import ExpenseChatConsumer
    return [
        re_path(r"ws/ai/chat/(?P<mongo_id>[^/]+)/$", ExpenseChatConsumer.as_asgi()),
    ]


# Built at runtime by core/asgi.py
websocket_urlpatterns = []
