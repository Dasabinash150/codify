import React from "react";

const UserAvatar = ({ user, size = 44 }) => {
  const username = user?.username || "User";
  const avatar = user?.avatar || "";
  const initials = username.slice(0, 2).toUpperCase();

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={username}
        className="leaderboard-avatar-image"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="leaderboard-avatar-fallback"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;