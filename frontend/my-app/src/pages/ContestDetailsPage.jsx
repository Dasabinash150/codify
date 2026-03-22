import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/ContestDetailsPage.css";
import "../styles/global.css";
import "../styles/variables.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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

function ContestDetailsPage() {
    const { id, problemId } = useParams();
    const [selectedProblemId, setSelectedProblemId] = useState(Number(problemId) || 1);
    const [joined, setJoined] = useState(false);

    const contest = useMemo(() => {
        return { ...contestData, id: id || contestData.id };
    }, [id]);

    const getDifficultyClass = (difficulty) => {
        const value = difficulty.toLowerCase();
        if (value === "easy") return "difficulty-easy";
        if (value === "medium") return "difficulty-medium";
        if (value === "hard") return "difficulty-hard";
        return "difficulty-default";
    };

    const getProblemStatusClass = (status) => {
        const value = status.toLowerCase();
        if (value === "solved") return "problem-status-solved";
        if (value === "attempted") return "problem-status-attempted";
        return "problem-status-unsolved";
    };

    const getContestStatusClass = (status) => {
        const value = status.toLowerCase();
        if (value === "live") return "contest-badge-live";
        if (value === "upcoming") return "contest-badge-upcoming";
        return "contest-badge-ended";
    };

    return (
        <>
            <Navbar />
            <div className="contest-details-page py-4 py-lg-3">
                <div className="container">
                    <div className="contest-details-shell">
                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-3 mb-4">
                            <div className="contest-header-content">
                                <Link to="/contests" className="contest-back-link">
                                    ← Back to Contests
                                </Link>

                                <div className="d-flex flex-wrap align-items-center gap-2 mt-3 mb-2">
                                    <span className={`contest-main-badge ${getContestStatusClass(contest.status)}`}>
                                        {contest.status}
                                    </span>
                                    <span className="contest-id-badge">Contest #{contest.id}</span>
                                </div>

                                <h1 className="contest-main-title mb-2">{contest.title}</h1>
                                <p className="contest-main-description mb-0">{contest.description}</p>
                            </div>

                            <div className="contest-header-actions">
                                <button
                                    type="button"
                                    className={`btn ${joined ? "btn-outline-secondary" : "contest-primary-btn"}`}
                                    onClick={() => setJoined(!joined)}
                                >
                                    {joined ? "Joined" : "Join Contest"}
                                </button>
                            </div>
                        </div>

                        <div className="row g-3 mb-4">
                            <div className="col-6 col-lg-3">
                                <div className="contest-stat-card h-100">
                                    <p className="contest-stat-label mb-1">Timer</p>
                                    <h5 className="contest-stat-value mb-0">{contest.timer}</h5>
                                </div>
                            </div>

                            <div className="col-6 col-lg-3">
                                <div className="contest-stat-card h-100">
                                    <p className="contest-stat-label mb-1">Participants</p>
                                    <h5 className="contest-stat-value mb-0">{contest.participants}</h5>
                                </div>
                            </div>

                            <div className="col-6 col-lg-3">
                                <div className="contest-stat-card h-100">
                                    <p className="contest-stat-label mb-1">Problems</p>
                                    <h5 className="contest-stat-value mb-0">{contest.totalProblems}</h5>
                                </div>
                            </div>

                            <div className="col-6 col-lg-3">
                                <div className="contest-stat-card h-100">
                                    <p className="contest-stat-label mb-1">Your Status</p>
                                    <h5 className="contest-stat-value mb-0">
                                        {joined ? "Ready" : "Not Joined"}
                                    </h5>
                                </div>
                            </div>
                        </div>

                        <div className="row g-4">
                            <div className="col-lg-4">
                                <div className="contest-panel-card mb-4">
                                    <div className="contest-panel-body">
                                        <h5 className="contest-section-title mb-3">Contest Rules</h5>

                                        <ul className="contest-rules-list mb-0">
                                            {contest.rules.map((rule, index) => (
                                                <li key={index}>{rule}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="contest-panel-card">
                                    <div className="contest-panel-body">
                                        <h5 className="contest-section-title mb-3">Quick Actions</h5>

                                        <div className="d-grid gap-2">
                                            <Link to={`/contest/${contest.id}/leaderboard`} className="btn contest-outline-btn">
                                                View Leaderboard
                                            </Link>

                                            <Link to="/dashboard" className="btn contest-outline-btn">
                                                Go to Dashboard
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-8">
                                <div className="contest-panel-card overflow-hidden">
                                    <div className="contest-table-header">
                                        <h5 className="mb-0 contest-section-title">Problem List</h5>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table contest-theme-table align-middle mb-0">
                                            <thead>
                                                <tr>
                                                    <th className="ps-4">Problem</th>
                                                    <th>Difficulty</th>
                                                    <th>Points</th>
                                                    <th>Status</th>
                                                    <th className="text-center pe-4">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {contest.problems.map((problem) => (
                                                    <tr key={problem.id}>
                                                        <td className="ps-4">
                                                            <div className="fw-semibold">{problem.title}</div>
                                                        </td>

                                                        <td>
                                                            <span className={`contest-chip ${getDifficultyClass(problem.difficulty)}`}>
                                                                {problem.difficulty}
                                                            </span>
                                                        </td>

                                                        <td className="fw-semibold">{problem.points}</td>

                                                        <td>
                                                            <span className={`contest-chip ${getProblemStatusClass(problem.status)}`}>
                                                                {problem.status}
                                                            </span>
                                                        </td>

                                                        <td className="text-center pe-4">
                                                            <Link to={`/contest/${contest.id}/problem/${problem.id}`} className="btn btn-sm contest-primary-btn">
                                                                Solve
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="contest-panel-card mt-4">
                                    <div className="contest-panel-body">
                                        <h6 className="contest-section-title mb-2">Note</h6>
                                        <p className="text-muted-custom mb-0">
                                            Submit each problem before the timer ends. Your final rank will depend on
                                            total score and completion time.
                                        </p>
                                    </div>
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

export default ContestDetailsPage;