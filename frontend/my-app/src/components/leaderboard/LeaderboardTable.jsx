import React from "react";
import LeaderboardRow from "./LeaderboardRow";

const LeaderboardTable = ({
  users = [],
  currentUserId = null,
  highlightUser = null,
  title = "Leaderboard Rankings",
}) => {
  return (
    <section className="leaderboard-card leaderboard-table-section">
      <div className="leaderboard-section-head">
        <div>
          <h2 className="leaderboard-section-title">{title}</h2>
        </div>
      </div>

      <div className="leaderboard-table-scroll">
        <table className="table leaderboard-table align-middle mb-0">
          <thead>
            <tr>
              <th className="text-center">Rank</th>
              <th>User</th>
              <th className="text-center">Solved</th>
              <th className="text-center">Score</th>
              <th className="text-center">Penalty</th>
            </tr>
          </thead>

          <tbody>
            {users.length ? (
              users.map((user) => (
                <LeaderboardRow
                  key={user.id}
                  user={user}
                  highlight={
                    typeof highlightUser === "function"
                      ? highlightUser(user)
                      : user.id === currentUserId
                  }
                />
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center leaderboard-empty">
                  No leaderboard data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default LeaderboardTable;