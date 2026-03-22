import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/ProblemsPage.css";

const problemData = [
  { id: 1, title: "Two Sum", difficulty: "Easy", status: "Solved", tags: ["Array", "HashMap"] },
  { id: 2, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", status: "Attempted", tags: ["String", "Sliding Window"] },
  { id: 3, title: "Median of Two Sorted Arrays", difficulty: "Hard", status: "Unsolved", tags: ["Binary Search"] },
  { id: 4, title: "Valid Parentheses", difficulty: "Easy", status: "Solved", tags: ["Stack"] },
  { id: 5, title: "Merge Intervals", difficulty: "Medium", status: "Unsolved", tags: ["Sorting", "Array"] },
  { id: 6, title: "Word Ladder", difficulty: "Hard", status: "Attempted", tags: ["Graph", "BFS"] },
  { id: 7, title: "Best Time to Buy and Sell Stock", difficulty: "Easy", status: "Solved", tags: ["Array"] },
  { id: 8, title: "Course Schedule", difficulty: "Medium", status: "Unsolved", tags: ["Graph", "Topological Sort"] },
];

function ProblemsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredProblems = useMemo(() => {
    return problemData.filter((problem) => {
      const matchSearch =
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.tags.join(" ").toLowerCase().includes(searchTerm.toLowerCase());

      const matchDifficulty =
        difficultyFilter === "All" || problem.difficulty === difficultyFilter;

      const matchStatus =
        statusFilter === "All" || problem.status === statusFilter;

      return matchSearch && matchDifficulty && matchStatus;
    });
  }, [searchTerm, difficultyFilter, statusFilter]);

  return (
    <>
      <Navbar />

      <div className="problems-page py-4 py-lg-5">
        <div className="container">
          <div className="problems-hero mb-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
              <div>
                <h2 className="fw-bold mb-1">Problem List</h2>
                <p className="mb-0 text-muted-custom">
                  Practice coding problems by difficulty, topic, and solve status.
                </p>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <Link to="/dashboard" className="btn btn-outline-theme">
                  Dashboard
                </Link>
                <Link to="/contests" className="btn btn-primary-custom">
                  View Contests
                </Link>
              </div>
            </div>
          </div>

          <div className="problems-card p-3 p-lg-4 mb-4">
            <div className="row g-3">
              <div className="col-md-6 col-lg-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by problem name or tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="col-md-3 col-lg-3">
                <select
                  className="form-select"
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                  <option value="All">All Difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="col-md-3 col-lg-3">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Solved">Solved</option>
                  <option value="Attempted">Attempted</option>
                  <option value="Unsolved">Unsolved</option>
                </select>
              </div>

              <div className="col-lg-1 d-grid">
                <button
                  className="btn btn-outline-theme"
                  onClick={() => {
                    setSearchTerm("");
                    setDifficultyFilter("All");
                    setStatusFilter("All");
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="stat-card p-3 p-lg-4 h-100">
                <div className="stat-label mb-1">Total Problems</div>
                <div className="stat-value">{problemData.length}</div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="stat-card p-3 p-lg-4 h-100">
                <div className="stat-label mb-1">Solved</div>
                <div className="stat-value">
                  {problemData.filter((p) => p.status === "Solved").length}
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="stat-card p-3 p-lg-4 h-100">
                <div className="stat-label mb-1">Showing</div>
                <div className="stat-value">{filteredProblems.length}</div>
              </div>
            </div>
          </div>

          <div className="problems-card problems-table-wrap">
            <div className="table-responsive">
              <table className="table align-middle problems-table">
                <thead>
                  <tr>
                    <th className="ps-4">Problem</th>
                    <th>Difficulty</th>
                    <th>Status</th>
                    <th>Tags</th>
                    <th className="text-center pe-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.length > 0 ? (
                    filteredProblems.map((problem) => (
                      <tr key={problem.id}>
                        <td className="ps-4">
                          <div className="problem-title">{problem.title}</div>
                          <div className="problem-subtext">Problem #{problem.id}</div>
                        </td>

                        <td>
                          <span
                            className={`difficulty-badge difficulty-${problem.difficulty.toLowerCase()}`}
                          >
                            {problem.difficulty}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`status-badge status-${problem.status.toLowerCase()}`}
                          >
                            {problem.status}
                          </span>
                        </td>

                        <td>
                          <div className="d-flex flex-wrap gap-2">
                            {problem.tags.map((tag, index) => (
                              <span key={index} className="tag-pill">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="text-center pe-4">
                          <Link
                            to={`/problems/${problem.id}`}
                            className="btn btn-sm btn-primary-custom px-3"
                          >
                            Solve
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center empty-state">
                        No problems found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProblemsPage;