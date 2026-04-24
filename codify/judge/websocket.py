from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from contest.models import Leaderboard


def serialize_leaderboard(contest_id):
    rows = (
        Leaderboard.objects.filter(contest_id=contest_id)
        .select_related("user")
        .order_by(
            "rank",
            "-score",
            "-solved",
            "penalty",
            "last_updated",
            "id",
        )
    )

    data = []

    for row in rows:
        data.append({
            "id": row.user.id,
            "rank": row.rank,
            "user_name": getattr(row.user, "username", None)
                or getattr(row.user, "email", None)
                or str(row.user),
            "email": getattr(row.user, "email", ""),
            "score": row.score,
            "solved": row.solved,
            "penalty": row.penalty,
            "last_updated": row.last_updated.isoformat()
            if row.last_updated else None,
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