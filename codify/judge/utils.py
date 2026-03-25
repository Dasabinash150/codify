def normalize_output(output: str) -> str:
    if output is None:
        return ""
    # remove trailing spaces from each line and remove extra blank lines
    lines = [line.rstrip() for line in output.strip().splitlines()]
    return "\n".join(lines)


# def compare_output(actual: str, expected: str) -> bool:
#     return normalize_output(actual) == normalize_output(expected)

def compare_output(actual, expected):
    actual = "\n".join(line.rstrip() for line in actual.strip().splitlines())
    expected = "\n".join(line.rstrip() for line in expected.strip().splitlines())
    return actual == expected

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def broadcast_leaderboard(contest_id, leaderboard_data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"contest_{contest_id}",
        {
            "type": "leaderboard_event",
            "leaderboard": leaderboard_data
        }
    )


def broadcast_submission_update(contest_id, submission_data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"contest_{contest_id}",
        {
            "type": "submission_event",
            "data": submission_data
        }
    )