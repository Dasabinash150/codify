import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getProblems } from "../services/problemApi";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/ProblemsPage.css";

function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  useEffect(() => {
    const loadProblems = async () => {
      try {
        setLoading(true);
        const res = await getProblems();
        setProblems(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch problems:", error);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };

    loadProblems();
  }, []);

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const title = problem.title || "";
      const tags = Array.isArray(problem.tags) ? problem.tags.join(" ") : "";
      const difficulty = problem.difficulty || "";

      const matchSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tags.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDifficulty =
        difficultyFilter === "All" ||
        difficulty.toLowerCase() === difficultyFilter.toLowerCase();

      return matchSearch && matchDifficulty;
    });
  }, [problems, searchTerm, difficultyFilter]);

  const totalProblems = problems.length;
  const easyCount = problems.filter(
    (p) => (p.difficulty || "").toLowerCase() === "easy"
  ).length;
  const mediumCount = problems.filter(
    (p) => (p.difficulty || "").toLowerCase() === "medium"
  ).length;
  const hardCount = problems.filter(
    (p) => (p.difficulty || "").toLowerCase() === "hard"
  ).length;

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
                  Practice coding problems by difficulty and topic.
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
              <div className="col-md-8 col-lg-7">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by problem name or tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="col-md-4 col-lg-3">
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

              <div className="col-lg-2 d-grid">
                <button
                  className="btn btn-outline-theme"
                  onClick={() => {
                    setSearchTerm("");
                    setDifficultyFilter("All");
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className="d-flex flex-wrap align-items-center gap-3 problem-stats-inline">

              <span className="stats-pill">
                <strong>Total Problem:</strong> {totalProblems}
              </span>

              <span className="stats-pill easy">
                <strong>Easy:</strong> {easyCount}
              </span>

              <span className="stats-pill medium">
                <strong>Medium:</strong> {mediumCount}
              </span>

              <span className="stats-pill hard">
                <strong>Hard:</strong> {hardCount}
              </span>

            </div>
          </div>

          <div className="problems-card problems-table-wrap">
            <div className="table-responsive">
              <table className="table align-middle problems-table">
                <thead>
                  <tr>
                    <th className="ps-4">Problem</th>
                    <th>Difficulty</th>
                    <th>Tags</th>
                    <th className="text-center pe-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <div className="spinner-border" role="status" />
                      </td>
                    </tr>
                  ) : filteredProblems.length > 0 ? (
                    filteredProblems.map((problem) => (
                      <tr key={problem.id}>
                        <td className="ps-4">
                          <div className="problem-title">{problem.title}</div>
                          <div className="problem-subtext">Problem #{problem.id}</div>
                        </td>

                        <td>
                          <span
                            className={`difficulty-badge difficulty-${(
                              problem.difficulty || "easy"
                            ).toLowerCase()}`}
                          >
                            {problem.difficulty}
                          </span>
                        </td>

                        <td>
                          <div className="d-flex flex-wrap gap-2">
                            {Array.isArray(problem.tags) && problem.tags.length > 0 ? (
                              problem.tags.map((tag, index) => (
                                <span key={index} className="tag-pill">
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted-custom">No tags</span>
                            )}
                          </div>
                        </td>
                        <td className="text-center pe-4">
                          <div className="d-flex justify-content-center gap-2 flex-wrap">
                            {/* <Link
                              to={`/problems/${problem.id}`}
                              className="btn btn-sm btn-outline-secondary px-3"
                            >
                              View
                            </Link> */}
                            <Link
                              to={`/problems/${problem.id}/editor`}
                              className="btn btn-sm btn-primary-custom px-3"
                            >
                              Solve
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center empty-state">
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