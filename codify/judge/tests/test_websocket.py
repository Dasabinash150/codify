
import pytest
from channels.testing import WebsocketCommunicator
from codify.asgi import application

@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_websocket_connect(contest):

    communicator = WebsocketCommunicator(
        application,
        f"/ws/contest/{contest.id}/"
    )

    connected, _ = await communicator.connect()
    assert connected is True

    await communicator.disconnect()
