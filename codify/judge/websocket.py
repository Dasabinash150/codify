from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from contest.models import Leaderboard


def serialize_leaderboard(contest_id):
    rows = (
        Leaderboard.objects.filter(contest_id=contest_id)
        .select_related("user")
        .order_by("rank", "-score", "-solved", "penalty", "last_updated", "id")
    )

    data = []
    for row in rows:
        data.append({
            "rank": row.rank,
            "user_name": (
                getattr(row.user, "username", None)
                or getattr(row.user, "user_name", None)
                or getattr(row.user, "email", None)
                or getattr(row.user, "name", None)
                or str(row.user)
            ),
            "score": row.score,
            "submissions": getattr(row, "submissions", 0),
            "solved": getattr(row, "solved", 0),
            "penalty": getattr(row, "penalty", 0),
            "time": row.last_updated.strftime("%H:%M:%S") if row.last_updated else "00:00:00",
        })
    return data


def broadcast_leaderboard(contest_id):
    channel_layer = get_channel_layer()
    leaderboard_data = serialize_leaderboard(contest_id)

    async_to_sync(channel_layer.group_send)(
        f"contest_{contest_id}",
        {
            "type": "leaderboard_event",
            "leaderboard": leaderboard_data,
        }
    )


def broadcast_submission_update(contest_id, submission_data):
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f"contest_{contest_id}",
        {
            "type": "submission_event",
            "data": submission_data,
        }
    )


def broadcast_participant_count(contest_id, count):
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f"contest_{contest_id}",
        {
            "type": "participant_count_event",
            "count": count,
        }
    )