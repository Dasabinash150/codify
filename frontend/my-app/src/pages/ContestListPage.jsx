import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";

const API = import.meta.env.VITE_API_BASE_URL;

function ContestPage() {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getStatus = (start, end) => {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (now < startTime) return "Upcoming";
    if (now >= startTime && now <= endTime) return "Live";
    return "Ended";
  };

  useEffect(() => {
    const fetchContest = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/contests/${id}/`);
        setContest(res.data);
      } catch (err) {
        console.error("Contest fetch error:", err);
        setError("Failed to load contest.");
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [id]);

  const status = useMemo(() => {
    if (!contest) return "";
    return contest.status || getStatus(contest.start_time, contest.end_time);
  }, [contest]);

  const statusClass = useMemo(() => {
    if (status === "Live") return "bg-danger";
    if (status === "Upcoming") return "bg-warning text-dark";
    return "bg-secondary";
  }, [status]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="text-center">Loading contest...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !contest) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger mb-0">{error || "Contest not found."}</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="contest-list-page py-4 py-lg-5">
        <div className="container">
          <div className="contest-list-hero mb-4 mb-lg-5">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
              <div>
                <p className="contest-list-label mb-2">Coding Contest</p>
                <h1 className="contest-list-title mb-2">{contest.name}</h1>
                <p className="contest-list-subtitle mb-0">
                  {contest.description || "Solve the contest problems and track your ranking."}
                </p>
              </div>

              <div className="contest-list-summary">
                <div className="summary-box">
                  <span className="summary-value">{contest.contest_problems?.length || 0}</span>
                  <span className="summary-label">Problems</span>
                </div>
                <div className="summary-box">
                  <span className={`badge ${statusClass}`}>{status}</span>
                  <span className="summary-label mt-2 d-block">Status</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card contest-filter-card mb-4">
            <div className="card-body">
              <div className="row g-3 align-items-center">
                <div className="col-lg-8">
                  <div>
                    <strong>Start:</strong> {new Date(contest.start_time).toLocaleString()}
                  </div>
                </div>

                <div className="col-lg-4">
                  <div>
                    <strong>End:</strong> {new Date(contest.end_time).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {(contest.contest_problems || []).map((item, index) => (
              <div className="col-md-6 col-xl-4" key={item.id}>
                <div className="card contest-card h-100">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                      <span className="badge bg-primary">Problem {index + 1}</span>
                      <span
                        className={`contest-difficulty ${
                          item.problem.difficulty === "easy"
                            ? "difficulty-easy"
                            : item.problem.difficulty === "medium"
                            ? "difficulty-medium"
                            : "difficulty-hard"
                        }`}
                      >
                        {item.problem.difficulty}
                      </span>
                    </div>

                    <h4 className="contest-card-title mb-2">{item.problem.title}</h4>
                    <p className="contest-card-desc mb-3">
                      {item.problem.description?.slice(0, 110)}...
                    </p>

                    <div className="contest-meta-grid mb-4">
                      <div className="meta-item">
                        <span className="meta-label">Points</span>
                        <span className="meta-value">{item.problem.points}</span>
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">Difficulty</span>
                        <span className="meta-value">{item.problem.difficulty}</span>
                      </div>
                    </div>

                    <div className="contest-actions mt-auto">
                      <Link
                        to={`/contest/${contest.id}/problem/${item.problem.id}`}
                        className="btn contest-btn-primary"
                      >
                        Solve
                      </Link>

                      <Link
                        to={`/contest/${contest.id}/leaderboard`}
                        className="btn contest-btn-outline"
                      >
                        Leaderboard
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(contest.contest_problems || []).length === 0 && (
            <div className="card contest-empty-card mt-4">
              <div className="card-body text-center py-5">
                <h5 className="mb-2">No problems found</h5>
                <p className="text-muted-custom mb-0">
                  This contest currently has no assigned problems.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default ContestPage;