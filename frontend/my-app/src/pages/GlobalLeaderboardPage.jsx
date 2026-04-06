import React, { useEffect, useState } from "react";
import TopThreePodium from "../components/leaderboard/TopThreePodium";
import LeaderboardTable from "../components/leaderboard/LeaderboardTable";
import "../styles/LeaderboardPage.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const LeaderboardPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const currentUsername = "you";

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard/");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
      setUsers([]);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      (u.full_name || "").toLowerCase().includes(q)
    );
  });

  const topUsers = filteredUsers.filter((u) => u.rank <= 3);
  const tableUsers = filteredUsers.filter((u) => u.rank > 3);

  const highlightUser = (user) => user.username === currentUsername;

  return (
    <>
      <Navbar />
      <div className="leaderboard-page">
        <div className="container leaderboard-shell">
          <section className="leaderboard-hero">
            <div>
              <div className="leaderboard-kicker">Global Ranking</div>
              <h1 className="leaderboard-title">Global Leaderboard</h1>
              <p className="leaderboard-subtitle">
                Compact ranking with dark and light support
              </p>
            </div>

            <div className="leaderboard-search-wrap">
              <span className="leaderboard-search-icon">⌕</span>
              <input
                type="text"
                className="form-control leaderboard-search"
                placeholder="Search user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </section>

          <div className="leaderboard-main">
            <TopThreePodium users={topUsers.length ? topUsers : users} />

            <LeaderboardTable
              users={tableUsers.length ? tableUsers : filteredUsers}
              highlightUser={highlightUser}
              title="Global Rankings"
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LeaderboardPage;