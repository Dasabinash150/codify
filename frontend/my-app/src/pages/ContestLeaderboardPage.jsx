import React, { useMemo, useState } from "react";
import TopThreePodium from "../components/leaderboard/TopThreePodium";
import LeaderboardTable from "../components/leaderboard/LeaderboardTable";
import "../styles/LeaderboardPage.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const mockContestLeaderboard = [
  { id: 11, rank: 1, username: "abinash", full_name: "Abinash Das", score: 500, solved: 5, penalty: 8, avatar: "" },
  { id: 12, rank: 2, username: "riya", full_name: "Riya Sharma", score: 450, solved: 4, penalty: 11, avatar: "" },
  { id: 13, rank: 3, username: "soumya", full_name: "Soumya Ranjan", score: 420, solved: 4, penalty: 16, avatar: "" },
  { id: 14, rank: 4, username: "manas", full_name: "Manas Sahoo", score: 390, solved: 3, penalty: 19, avatar: "" },
  { id: 15, rank: 5, username: "aditya", full_name: "Aditya Singh", score: 360, solved: 3, penalty: 24, avatar: "" },
  { id: 16, rank: 6, username: "priyanshu", full_name: "Priyanshu Kumar", score: 340, solved: 3, penalty: 27, avatar: "" },
  { id: 17, rank: 7, username: "deepak", full_name: "Deepak Kumar", score: 320, solved: 3, penalty: 31, avatar: "" },
  { id: 18, rank: 8, username: "ayush", full_name: "Ayush Raj", score: 300, solved: 2, penalty: 36, avatar: "" },
  { id: 19, rank: 9, username: "neha", full_name: "Neha Patel", score: 280, solved: 2, penalty: 38, avatar: "" },
  { id: 20, rank: 10, username: "rohit", full_name: "Rohit Das", score: 260, solved: 2, penalty: 40, avatar: "" },
  { id: 21, rank: 11, username: "mili", full_name: "Mili Sharma", score: 240, solved: 2, penalty: 44, avatar: "" },
  { id: 22, rank: 12, username: "sneha", full_name: "Sneha Das", score: 220, solved: 2, penalty: 47, avatar: "" },
  { id: 23, rank: 13, username: "akash", full_name: "Akash Behera", score: 210, solved: 1, penalty: 49, avatar: "" },
];

const ContestLeaderboardPage = () => {
  const [search, setSearch] = useState("");
  const currentUserId = 11;

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return mockContestLeaderboard;

    return mockContestLeaderboard.filter((user) => {
      return (
        user.username.toLowerCase().includes(term) ||
        (user.full_name || "").toLowerCase().includes(term)
      );
    });
  }, [search]);

  const podiumUsers = filteredUsers.filter((user) => user.rank <= 3);
  const tableUsers = filteredUsers.filter((user) => user.rank > 3);

  return (
    <>
    <Navbar />
    <div className="leaderboard-page">
      <div className="container leaderboard-shell">
        <section className="leaderboard-hero">
          <div>
            <div className="leaderboard-kicker">Contest Ranking</div>
            <h1 className="leaderboard-title">Contest Leaderboard</h1>
            <p className="leaderboard-subtitle">
              April Challenge 2026 · Live contest ranking
            </p>
          </div>

          <div className="leaderboard-search-wrap">
            <span className="leaderboard-search-icon">⌕</span>
            <input
              type="text"
              className="form-control leaderboard-search"
              placeholder="Search participant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </section>

        <div className="leaderboard-main">
          <TopThreePodium users={podiumUsers.length ? podiumUsers : filteredUsers} />

          <LeaderboardTable
            users={tableUsers.length ? tableUsers : filteredUsers}
            currentUserId={currentUserId}
            title="Contest Rankings"
          />
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default ContestLeaderboardPage;