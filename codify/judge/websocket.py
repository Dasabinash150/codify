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
            "user_name": str(row.user),
            "score": row.score,
            "submissions": getattr(row, "submissions", 0),
            "solved": getattr(row, "solved", 0),
            "penalty": getattr(row, "penalty", 0),
            "time": row.last_updated.strftime("%H:%M:%S") if row.last_updated else "00:00:00",
        })
    return data


def _broadcast(contest_id, event_name, data):
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f"contest_{contest_id}",
        {
            "type": "broadcast_event",
            "event": event_name,
            "data": data,
        }
    )


def broadcast_leaderboard(contest_id):
    leaderboard_data = serialize_leaderboard(contest_id)

    _broadcast(
        contest_id,
        "leaderboard_update",
        {
            "contest_id": contest_id,
            "leaderboard": leaderboard_data,
        }
    )


def broadcast_submission_update(contest_id, submission_data):
    _broadcast(contest_id, "submission_update", submission_data)


def broadcast_participant_count(contest_id, count):
    _broadcast(
        contest_id,
        "participant_count_update",
        {
            "contest_id": contest_id,
            "participant_count": count,
        }
    )