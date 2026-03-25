from django.urls import re_path
from .consumers import ContestConsumer

websocket_urlpatterns = [
    re_path(r"ws/contest/(?P<contest_id>\d+)/$", ContestConsumer.as_asgi()),
]