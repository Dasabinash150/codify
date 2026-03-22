import React, { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/ContestPage.css";
import "../App.css"

const contestData = {
  id: 1,
  title: "Weekly Coding Challenge 12",
  status: "Live",
  timer: "00:42:15",
  participants: 1248,
  totalProblems: 4,
  description:
    "Solve the contest problems within the time limit. Submissions will be ranked based on score and completion time.",
  rules: [
    "Contest duration is 60 minutes.",
    "Each problem carries different points.",
    "Use of unfair means is prohibited.",
    "Leaderboard rank depends on score and submission time.",
  ],
  problems: [
    { id: 1, title: "Two Sum", difficulty: "Easy", points: 100, status: "Solved" },
    { id: 2, title: "Valid Parentheses", difficulty: "Easy", points: 100, status: "Unsolved" },
    { id: 3, title: "Merge Intervals", difficulty: "Medium", points: 200, status: "Attempted" },
    { id: 4, title: "Word Ladder", difficulty: "Hard", points: 300, status: "Unsolved" },
  ],
};

function ContestPage() {
  const [joined, setJoined] = useState(false);

  return (
    <div className="contest-page py-4">
      <div className="container">
        {/* Top Header */}
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
          <div>
            <Link to="/contests" className="text-decoration-none small back-link">
              ← Back to Contests
            </Link>
            <h2 className="fw-bold mb-1 mt-2">{contestData.title}</h2>
            <p className="text-muted mb-0">{contestData.description}</p>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <span className="badge rounded-pill px-3 py-2 status-live">
              {contestData.status}
            </span>
            <button
              className={`btn ${joined ? "btn-outline-secondary" : "btn-primary-custom"}`}
              onClick={() => setJoined(!joined)}
            >
              {joined ? "Joined" : "Join Contest"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <p className="text-muted mb-1">Timer</p>
                <h5 className="fw-bold mb-0">{contestData.timer}</h5>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <p className="text-muted mb-1">Participants</p>
                <h5 className="fw-bold mb-0">{contestData.participants}</h5>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <p className="text-muted mb-1">Problems</p>
                <h5 className="fw-bold mb-0">{contestData.totalProblems}</h5>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <p className="text-muted mb-1">Your Status</p>
                <h5 className="fw-bold mb-0">{joined ? "Ready" : "Not Joined"}</h5>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Left Side */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="fw-semibold mb-3">Contest Rules</h5>
                <ul className="mb-0 ps-3">
                  {contestData.rules.map((rule, index) => (
                    <li key={index} className="mb-2 text-muted">
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="fw-semibold mb-3">Quick Actions</h5>
                <div className="d-grid gap-2">
                  <Link to="/leaderboard" className="btn btn-outline-secondary">
                    View Leaderboard
                  </Link>
                  <Link to="/dashboard" className="btn btn-outline-secondary">
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="px-4 py-3 border-bottom">
                  <h5 className="mb-0 fw-semibold">Problem List</h5>
                </div>

                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Problem</th>
                        <th>Difficulty</th>
                        <th>Points</th>
                        <th>Status</th>
                        <th className="text-center pe-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contestData.problems.map((problem) => (
                        <tr key={problem.id}>
                          <td className="ps-4 fw-semibold">{problem.title}</td>

                          <td>
                            <span
                              className={`badge rounded-pill px-3 py-2 difficulty-${problem.difficulty.toLowerCase()}`}
                            >
                              {problem.difficulty}
                            </span>
                          </td>

                          <td>{problem.points}</td>

                          <td>
                            <span
                              className={`badge rounded-pill px-3 py-2 contest-status-${problem.status.toLowerCase()}`}
                            >
                              {problem.status}
                            </span>
                          </td>

                          <td className="text-center pe-4">
                            <Link
                              to={`/problems/${problem.id}`}
                              className="btn btn-sm btn-primary-custom"
                            >
                              Solve
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Contest Note */}
            <div className="card border-0 shadow-sm mt-4">
              <div className="card-body">
                <h6 className="fw-semibold mb-2">Note</h6>
                <p className="text-muted mb-0">
                  Submit each problem before the timer ends. Your final rank will
                  depend on total score and completion time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContestPage;