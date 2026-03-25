import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.cache import cache
from django.utils.timezone import now
from .models import Contest


class ContestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.contest_id = self.scope["url_route"]["kwargs"]["contest_id"]
        self.room_group_name = f"contest_{self.contest_id}"
        self.count_key = f"contest_{self.contest_id}_participants"

        contest_exists = await self.check_contest_exists(self.contest_id)
        if not contest_exists:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        count = cache.get(self.count_key, 0) + 1
        cache.set(self.count_key, count, timeout=None)

        contest = await self.get_contest(self.contest_id)

        await self.send(text_data=json.dumps({
            "event": "contest_time",
            "data": {
                "server_time": now().isoformat(),
                "start_time": contest.start_time.isoformat() if contest.start_time else None,
                "end_time": contest.end_time.isoformat() if contest.end_time else None,
            }
        }))

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "participant_count_event",
                "count": count,
            }
        )

    async def disconnect(self, close_code):
        count = max(cache.get(self.count_key, 1) - 1, 0)
        cache.set(self.count_key, count, timeout=None)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "participant_count_event",
                "count": count,
            }
        )

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data.get("event")

        if event == "ping":
            await self.send(text_data=json.dumps({
                "event": "pong",
                "data": {"message": "connection alive"}
            }))

    async def participant_count_event(self, event):
        await self.send(text_data=json.dumps({
            "event": "participant_count",
            "data": {
                "count": event["count"]
            }
        }))

    async def leaderboard_event(self, event):
        await self.send(text_data=json.dumps({
            "event": "leaderboard_update",
            "data": {
                "leaderboard": event["leaderboard"]
            }
        }))

    async def submission_event(self, event):
        await self.send(text_data=json.dumps({
            "event": "submission_update",
            "data": event["data"]
        }))

    @database_sync_to_async
    def check_contest_exists(self, contest_id):
        return Contest.objects.filter(id=contest_id).exists()

    @database_sync_to_async
    def get_contest(self, contest_id):
        return Contest.objects.get(id=contest_id)