import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
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
            <div className="problems-page py-4">
                <div className="container">
                    {/* Header */}
                    <div className="page-header d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                        <div>
                            <h2 className="fw-bold mb-1">Problem List</h2>
                            <p className="text-muted mb-0">
                                Practice coding problems by difficulty and topic.
                            </p>
                        </div>

                        <div className="d-flex gap-2 flex-wrap">
                            <Link to="/dashboard" className="btn btn-outline-secondary">
                                Dashboard
                            </Link>
                            <Link to="/contests" className="btn btn-primary-custom">
                                View Contests
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body">
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
                                        className="btn btn-light border"
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
                    </div>

                    {/* Stats */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm stat-card">
                                <div className="card-body">
                                    <p className="mb-1 text-muted">Total Problems</p>
                                    <h4 className="fw-bold mb-0">{problemData.length}</h4>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm stat-card">
                                <div className="card-body">
                                    <p className="mb-1 text-muted">Solved</p>
                                    <h4 className="fw-bold mb-0">
                                        {problemData.filter((p) => p.status === "Solved").length}
                                    </h4>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm stat-card">
                                <div className="card-body">
                                    <p className="mb-1 text-muted">Showing</p>
                                    <h4 className="fw-bold mb-0">{filteredProblems.length}</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table align-middle mb-0 problems-table">
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
                                                        <div className="fw-semibold">{problem.title}</div>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`badge rounded-pill px-3 py-2 difficulty-badge difficulty-${problem.difficulty.toLowerCase()}`}
                                                        >
                                                            {problem.difficulty}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`badge rounded-pill px-3 py-2 status-badge status-${problem.status.toLowerCase()}`}
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
                                                            className="btn btn-sm btn-primary-custom"
                                                        >
                                                            Solve
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-muted">
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
            </div>
        </>
    );
}

export default ProblemsPage;