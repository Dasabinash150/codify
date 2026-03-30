import json
from channels.generic.websocket import AsyncWebsocketConsumer


class ContestConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.contest_id = self.scope["url_route"]["kwargs"]["contest_id"]
        self.group_name = f"contest_{self.contest_id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        print("WebSocket connected:", self.group_name)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

        print("WebSocket disconnected")

    async def broadcast_event(self, event):
        await self.send(
            text_data=json.dumps({
                "event": event["event"],
                "data": event["data"],
            })
        )