import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/ContestDetailsPage.css";
import "../styles/global.css";
import "../styles/variables.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useContestSocket from "../hooks/useContestSocket";
import API from "../services/api";


function ContestDetailsPage() {
  const { id } = useParams();

  const [contest, setContest] = useState(null);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState("");


  useContestSocket(id, (msg) => {
    if (msg.event === "participant_count" || msg.event === "participant_update") {
      setContest((prev) =>
        prev
          ? {
            ...prev,
            participants: msg.data?.count ?? msg.count ?? prev.participants,
          }
          : prev
      );
    }
  });

  useEffect(() => {
    const fetchContestDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/contests/${id}/`);
        const data = response.data;

        // ✅ STEP 1: get problem ids
        const problemIds = (data.problems || []).map(p => p.problem_id);

        // ✅ STEP 2: fetch problem details
        const problemResponses = await Promise.all(
          problemIds.map(pid => API.get(`/problems/${pid}/`))
        );

        // ✅ STEP 3: extract data
        const problemData = problemResponses.map(res => res.data);

        // ✅ STEP 4: merge data
        const enrichedProblems = (data.problems || []).map((cp) => {
          const p = problemData.find(
            (item) => Number(item.id) === Number(cp.problem_id)
          );

          return {
            ...cp,
            title: p?.title || "Untitled",
            difficulty: p?.difficulty || "easy",
            points: p?.points || 100,
          };
        });

        // ✅ STEP 5: set contest
        setContest({
          id: data.id,
          title: data.name || "Untitled Contest",
          description: data.description || "No description available.",
          status: data.status || "Upcoming",
          participants: data.participants_count ?? 0,
          totalProblems: data.problems_count ?? 0,
          problems: enrichedProblems, // 🔥 IMPORTANT FIX
          startTime: data.start_time,
          endTime: data.end_time,
          duration: data.duration_minutes,
          rules:
            Array.isArray(data.rules) && data.rules.length > 0
              ? data.rules
              : [
                "Contest duration is based on start and end time.",
                "Solve problems within the allowed contest time.",
                "Ranking depends on score and submission time.",
                "Do not use unfair means.",
              ],
          timer:
            data.status === "Upcoming"
              ? "Starts Soon"
              : `${data.duration_minutes} min`,
        });

        setJoined(Boolean(data.joined || data.is_joined || data.registered || false));
      } catch (err) {
        console.error("Contest details error:", err?.response?.data || err.message);
        setError("Unable to load contest details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchContestDetails();
  }, [id]);
  useEffect(() => {
    if (!contest) return;

    const interval = setInterval(() => {
      const now = new Date();

      const start = new Date(contest.startTime);
      const end = new Date(contest.endTime);


      if (now < start) {
        const diff = start - now;
        setTimeLeft(`Starts in ${formatTime(diff)}`);
      } else if (now < end) {
        const diff = end - now;
        setTimeLeft(`Ends in ${formatTime(diff)}`);
      } else {
        setTimeLeft("Contest Ended");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [contest]);

  const difficultyClass = (difficulty = "") => {
    const value = difficulty.toLowerCase();
    if (value === "easy") return "difficulty-easy";
    if (value === "medium") return "difficulty-medium";
    if (value === "hard") return "difficulty-hard";
    return "difficulty-default";
  };

  const statusClass = (status = "") => {
    const value = status.toLowerCase();
    if (value === "solved") return "problem-status-solved";
    if (value === "attempted") return "problem-status-attempted";
    return "problem-status-unsolved";
  };

  const handleJoinContest = async () => {
    if (joined || joining) return;

    try {
      const token = localStorage.getItem("access");

      if (!token) {
        alert("Please login first.");
        return;
      }

      setJoining(true);

      const response = await API.post(`/contests/${id}/join/`);
      const data = response.data;

      setJoined(true);
      setContest((prev) => ({
        ...prev,
        participants: data.participants_count ?? prev.participants,
      }));
    } catch (err) {
      console.error("Join contest failed:", err?.response?.data || err.message);
      alert(err?.response?.data?.detail || err?.response?.data?.error || "Failed to join contest");
    } finally {
      setJoining(false);
    }
  };

  const contestBadgeClass = (status = "") => {
    const value = status.toLowerCase();
    if (value === "live") {
      return "bg-danger-subtle text-danger border border-danger-subtle";
    }
    if (value === "upcoming") {
      return "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
    }
    return "bg-secondary-subtle text-secondary-emphasis border";
  };

  const renderContestActionButton = () => {
    if (!contest) return null;

    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    const isStarted = now >= start;
    const isEnded = now > end;

    const contestStatus = String(contest?.status || "").toLowerCase();

    if (contestStatus === "ended" || contestStatus === "finished") {
      return (
        <Link
          to={`/contest/${contest.id}/leaderboard`}
          className="btn btn-outline-secondary px-3"
        >
          View Leaderboard
        </Link>
      );
    }

    if (joined && contest.problems?.length > 0) {
      return (
        <Link
          to={`/contest/${contest.id}/problem/${contest.problems[0].id}`}
          className="btn btn-success px-3"
          style={{
            pointerEvents: !isStarted || isEnded ? "none" : "auto",
            opacity: !isStarted || isEnded ? 0.6 : 1,
          }}
        >
          {!isStarted
            ? "Contest Not Started"
            : isEnded
              ? "Contest Ended"
              : "Enter Contest"}
        </Link>
      );
    }

    return (
      <button
        type="button"
        className="btn btn-primary px-3"
        onClick={handleJoinContest}
        disabled={joining}
      >
        {joining ? "Joining..." : "Join Contest"}
      </button>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-theme min-vh-100 py-4">
          <div className="container">
            <div className="card card-theme border-0 shadow-sm rounded-4">
              <div className="card-body p-4 text-center">
                <h5 className="mb-0">Loading contest details...</h5>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !contest) {
    return (
      <>
        <Navbar />
        <div className="page-theme min-vh-100 py-4">
          <div className="container">
            <div className="card card-theme border-0 shadow-sm rounded-4">
              <div className="card-body p-4 text-center">
                <h5 className="mb-2">Contest not available</h5>
                <p className="text-muted-custom mb-3">
                  {error || "No contest data found."}
                </p>
                <Link to="/contests" className="btn btn-primary px-3">
                  Back to Contests
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="page-theme min-vh-100 py-4">
        <div className="container">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-3 mb-4">
            <div className="flex-grow-1">
              <Link
                to="/contests"
                className="text-primary text-decoration-none fw-semibold small"
              >
                ← Back to Contests
              </Link>

              <div className="d-flex flex-wrap gap-2 mt-2 mb-2">
                <span
                  className={`badge rounded-pill px-3 py-2 ${contestBadgeClass(
                    contest.status
                  )}`}
                >
                  {contest.status}
                </span>

                <span className="badge rounded-pill px-3 py-2 contest-id-badge">
                  Contest #{contest.id}
                </span>
              </div>

              <h1 className="contest-title fw-bold mb-2">{contest.title}</h1>
              <p className="text-muted-custom mb-0 contest-description">
                {contest.description}
              </p>
            </div>

            <div className="d-grid d-lg-block">{renderContestActionButton()}</div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3">
              <div className="card card-theme border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-3">
                  <p className="small text-muted-custom mb-1">Timer</p>
                  <h5 className="mb-0 fw-bold">{timeLeft}</h5>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="card card-theme border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-3">
                  <p className="small text-muted-custom mb-1">Participants</p>
                  <h5 className="mb-0 fw-bold">{contest.participants}</h5>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="card card-theme border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-3">
                  <p className="small text-muted-custom mb-1">Problems</p>
                  <h5 className="mb-0 fw-bold">{contest.totalProblems}</h5>
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="card card-theme border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-3">
                  <p className="small text-muted-custom mb-1">Your Status</p>
                  <h5 className="mb-0 fw-bold">
                    {String(contest.status || "").toLowerCase() === "ended" ||
                      String(contest.status || "").toLowerCase() === "finished"
                      ? "Contest Closed"
                      : joined
                        ? "Ready"
                        : "Not Joined"}
                  </h5>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-4">
              <div className="card card-theme border-0 shadow-sm rounded-4 mb-3">
                <div className="card-body p-3 p-md-4">
                  <h5 className="fw-bold mb-3">Contest Rules</h5>
                  <ul className="mb-0 ps-3 text-muted-custom">
                    {contest.rules.map((rule, index) => (
                      <li key={index} className="mb-2">
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="card card-theme border-0 shadow-sm rounded-4">
                <div className="card-body p-3 p-md-4">
                  <h5 className="fw-bold mb-3">Quick Actions</h5>

                  <div className="d-grid gap-2">
                    <Link
                      to={`/contest/${contest.id}/leaderboard`}
                      className="btn btn-outline-primary"
                    >
                      View Leaderboard
                    </Link>

                    <Link to="/dashboard" className="btn btn-outline-secondary">
                      Go to Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="card card-theme border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-transparent border-bottom py-3 px-3 px-md-4">
                  <h5 className="fw-bold mb-0">Problem List</h5>
                </div>

                <div className="table-responsive">
                  <table className="table align-middle mb-0 contest-table">
                    <thead>
                      <tr>
                        <th className="ps-3 ps-md-4">Problem</th>
                        <th>Difficulty</th>
                        <th>Points</th>
                        {/* <th>Status</th>
                        <th className="text-center pe-3 pe-md-4">Action</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {contest.problems.length > 0 ? (
                        contest.problems.map((problem) => (
                          <tr key={problem.id}>
                            <td className="ps-3 ps-md-4 fw-semibold">{problem.title}</td>

                            <td>
                              <span
                                className={`badge rounded-pill px-3 py-2 ${difficultyClass(
                                  problem.difficulty
                                )}`}
                              >
                                {problem.difficulty}
                              </span>
                            </td>

                            <td className="fw-semibold">{problem.points}</td>

                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-muted-custom">
                            No problems available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card card-theme border-0 shadow-sm rounded-4 mt-3">
                <div className="card-body p-3 p-md-4">
                  <h6 className="fw-bold mb-2">Note</h6>
                  <p className="text-muted-custom mb-0">
                    Submit each problem before the timer ends. Final ranking depends on
                    total score and submission time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return `${h}h ${m}m ${s}s`;
}

export default ContestDetailsPage;