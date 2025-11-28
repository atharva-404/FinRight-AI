import os

# Ensure settings module is configured before importing Django internals
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application

# Initialize Django before loading consumers
django_asgi_app = get_asgi_application()

# Now safely import websocket patterns (consumers loaded after Django init)
from sockets.routing import get_websocket_urlpatterns

websocket_urlpatterns = get_websocket_urlpatterns()

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        ),
    }
)
