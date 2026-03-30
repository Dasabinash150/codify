import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack

import contest.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "codify.settings")
django.setup()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            contest.routing.websocket_urlpatterns
        )
    ),
})