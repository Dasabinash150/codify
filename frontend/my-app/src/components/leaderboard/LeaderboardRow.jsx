import React from "react";
import UserAvatar from "./UserAvatar";

const LeaderboardRow = ({ user, highlight = false }) => {
  const rankClass =
    user.rank === 1 || user.rank === 2 || user.rank === 3
      ? `rank-${user.rank}`
      : "rank-other";

  return (
    <tr className={highlight ? "leaderboard-row-highlight" : ""}>
      <td className="text-center">
        <span className={`rank-pill ${rankClass}`}>#{user.rank}</span>
      </td>

      <td>
        <div className="leaderboard-user-cell">
          <UserAvatar user={user} size={36} />

          <div className="leaderboard-user-meta">
            <div className="leaderboard-user-name">{user.username}</div>
            <div className="leaderboard-user-subtext">{user.full_name}</div>
          </div>
        </div>
      </td>

      <td className="text-center fw-semibold">{user.solved}</td>
      <td className="text-center fw-semibold leaderboard-score-text">
        {user.score}
      </td>
      <td className="text-center leaderboard-penalty-text">{user.penalty}</td>
    </tr>
  );
};

export default LeaderboardRow;