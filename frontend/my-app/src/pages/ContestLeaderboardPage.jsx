import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import TopThreePodium from "../components/leaderboard/TopThreePodium";
import LeaderboardTable from "../components/leaderboard/LeaderboardTable";
import "../styles/LeaderboardPage.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useContestSocket from "../hooks/useContestSocket";
import API from "../services/api";
import formatContestDuration from "../utils/formatContestDuration";

const ContestLeaderboardPage = () => {
  const { id } = useParams();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser =
    JSON.parse(localStorage.getItem("user")) || {};

  const currentUsername =
    localStorage.getItem("username") ||
    localStorage.getItem("email") ||
    "";



  const [contestInfo, setContestInfo] = useState({
    name: "",
    participants: 0,
    problems: 0,
    duration: ""
  });
  const fetchContest = async () => {
    try {
      const res = await API.get(`/contests/${id}/`);

      const data = res.data;

      setContestInfo({
        name: data.title || data.name || "Contest",

        participants:
          data.participants_count ||
          data.participant_count ||
          data.participants ||
          0,

        problems:
          data.problems_count ||
          data.problem_count ||
          data.problems?.length ||
          0,

        duration: formatContestDuration(
          data.duration_minutes || data.duration
        ),
      });

    } catch (err) {
      console.error("Contest fetch error:", err);
    }
  };
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(`/leaderboard/${id}/`);

      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data.results || response.data.data || [];

      const rankedUsers = rawData.map((item, index) => ({
        id: item.id || item.user_id || index + 1,
        rank: item.rank ?? index + 1,
        username:
          item.username ||
          item.user_name ||
          item.user?.username ||
          item.user?.name ||
          item.user?.email ||
          "Unknown",
        full_name:
          item.full_name ||
          item.name ||
          item.user?.full_name ||
          item.user?.name ||
          "",
        score: item.score ?? 0,
        solved: item.solved ?? item.problems_solved ?? 0,
        penalty: item.penalty ?? item.time_penalty ?? item.submissions ?? 0,
        avatar: item.avatar || item.profile_image || item.user?.avatar || "",
      }));

      setUsers(rankedUsers);
    } catch (err) {
      console.error("Contest leaderboard fetch error:", err);
      setError("Failed to load contest leaderboard");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (id) {
      fetchLeaderboard();
      fetchContest();
    }
  }, [id]);
  useContestSocket(id, (msg) => {
    if (msg?.event === "leaderboard_update") {
      fetchLeaderboard();
    }
  });

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return users;

    return users.filter((user) => {
      return (
        (user.username || "").toLowerCase().includes(term) ||
        (user.full_name || "").toLowerCase().includes(term)
      );
    });
  }, [users, search]);

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

              <h1 className="leaderboard-title">
                {contestInfo.name}
              </h1>

              <p className="leaderboard-subtitle">
                {contestInfo.participants} participants • {contestInfo.problems} problems • {contestInfo.duration}
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

          {loading ? (
            <div className="leaderboard-card p-4 text-center">
              Loading leaderboard...
            </div>
          ) : error ? (
            <div className="leaderboard-card p-4 text-center text-danger">
              {error}
            </div>
          ) : (
            <div className="leaderboard-main">
              <TopThreePodium users={podiumUsers.length ? podiumUsers : filteredUsers} />

              <LeaderboardTable
                users={tableUsers.length ? tableUsers : filteredUsers}
                highlightUser={(user) =>
                  (user.username || "")
                    .trim()
                    .toLowerCase()
                    .includes(
                      (currentUsername || "")
                        .trim()
                        .toLowerCase()
                    )
                }
                title="Contest Rankings"
              />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ContestLeaderboardPage;