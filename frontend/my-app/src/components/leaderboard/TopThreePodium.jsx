import React from "react";
import UserAvatar from "./UserAvatar";

const getTopThree = (users = []) => {
  const sorted = [...users].sort((a, b) => a.rank - b.rank);
  const first = sorted.find((u) => u.rank === 1);
  const second = sorted.find((u) => u.rank === 2);
  const third = sorted.find((u) => u.rank === 3);
  return [second, first, third].filter(Boolean);
};

const PodiumItem = ({ user }) => {
  const rank = user.rank;
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
  const rankClass =
    rank === 1
      ? "podium-item podium-item-first"
      : rank === 2
        ? "podium-item podium-item-second"
        : "podium-item podium-item-third";

  return (
    <div className={rankClass}>
      <div className="podium-medal">{medal}</div>

      <div className="podium-avatar-ring">
        <UserAvatar user={user} size={rank === 1 ? 72 : 62} />
      </div>

      <div className="podium-name">{user.username}</div>
      <div className="podium-subname">{user.full_name || "Top performer"}</div>

      <div className="podium-mini-stats">
        <span className="podium-mini-pill">#{user.rank}</span>
        <span className="podium-mini-pill">{user.score} pts</span>
        <span className="podium-mini-pill">{user.solved} solved</span>
      </div>
    </div>
  );
};

const TopThreePodium = ({ users = [] }) => {
  if (!users.length) return null;

  const topThree = getTopThree(users);

  return (
    <section className="leaderboard-card podium-section">
      <div className="podium-grid">
        {topThree.map((user) => (
          <PodiumItem key={user.id} user={user} />
        ))}
      </div>
    </section>
  );
};

export default TopThreePodium;