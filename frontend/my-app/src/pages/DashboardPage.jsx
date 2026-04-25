import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ProgressBar,
  Table,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  TrophyFill,
  CodeSlash,
  ClockHistory,
  BarChartFill,
  PlayFill,
  CheckCircleFill,
  ArrowRight,
} from "react-bootstrap-icons";

import Navbar from "../components/Navbar";
import API from "../services/api";
import "../styles/DashboardPage.css";

function DashboardPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [contests, setContests] = useState([]);
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const requests = [
          API.get("/user/profile/").catch(() => ({ data: null })),
          API.get("/submissions/").catch(() => ({ data: [] })),
          API.get("/contests/").catch(() => ({ data: [] })),
          API.get("/problems/").catch(() => ({ data: [] })),
        ];

        const [profileRes, submissionsRes, contestsRes, problemsRes] =
          await Promise.all(requests);

        const profileData = profileRes?.data || null;
        const submissionsData = Array.isArray(submissionsRes?.data)
          ? submissionsRes.data
          : submissionsRes?.data?.results || [];
        const contestsData = Array.isArray(contestsRes?.data)
          ? contestsRes.data
          : contestsRes?.data?.results || [];
        const problemsData = Array.isArray(problemsRes?.data)
          ? problemsRes.data
          : problemsRes?.data?.results || [];

        setProfile(profileData);
        setSubmissions(submissionsData);
        setContests(contestsData);
        setProblems(problemsData);
      } catch (err) {
        console.error("Dashboard API error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const acceptedCount = useMemo(() => {
    return submissions.filter(
      (item) =>
        item.status === "Accepted" ||
        item.status === "AC" ||
        item.status === "accepted"
    ).length;
  }, [submissions]);

  const totalSubmissions = submissions.length;

  const acceptanceRate = useMemo(() => {
    if (!totalSubmissions) return 0;
    return Math.round((acceptedCount / totalSubmissions) * 100);
  }, [acceptedCount, totalSubmissions]);

  const solvedProblemIds = useMemo(() => {
    const accepted = submissions.filter(
      (item) =>
        item.status === "Accepted" ||
        item.status === "AC" ||
        item.status === "accepted"
    );

    return new Set(
      accepted
        .map((item) => item.problem?.id || item.problem_id || item.problem)
        .filter(Boolean)
    );
  }, [submissions]);

  const problemsSolved = solvedProblemIds.size;

  const easySolved = useMemo(() => {
    return problems.filter(
      (p) =>
        solvedProblemIds.has(p.id) &&
        String(p.difficulty || "").toLowerCase() === "easy"
    ).length;
  }, [problems, solvedProblemIds]);

  const mediumSolved = useMemo(() => {
    return problems.filter(
      (p) =>
        solvedProblemIds.has(p.id) &&
        String(p.difficulty || "").toLowerCase() === "medium"
    ).length;
  }, [problems, solvedProblemIds]);

  const hardSolved = useMemo(() => {
    return problems.filter(
      (p) =>
        solvedProblemIds.has(p.id) &&
        String(p.difficulty || "").toLowerCase() === "hard"
    ).length;
  }, [problems, solvedProblemIds]);

  const totalProblems = problems.length;
  const completionPercent = totalProblems
    ? Math.round((problemsSolved / totalProblems) * 100)
    : 0;

  const now = new Date();

  const upcomingContests = useMemo(() => {
    return contests
      .filter((contest) => {
        const start = new Date(contest.start_time || contest.date);
        return start > now;
      })
      .sort(
        (a, b) =>
          new Date(a.start_time || a.date) - new Date(b.start_time || b.date)
      )
      .slice(0, 3);
  }, [contests]);

  const recentSubmissions = useMemo(() => {
    return [...submissions]
      .sort(
        (a, b) =>
          new Date(b.created_at || b.submitted_at || 0) -
          new Date(a.created_at || a.submitted_at || 0)
      )
      .slice(0, 5);
  }, [submissions]);

  // ===================Achievments part===========================
  const streak = profile?.streak || 0;

  const contestPercentile =
    profile?.contest_percentile ??
    profile?.percentile ??
    null;

  const totalAccepted =
    acceptedCount || 0;

  const achievementTitle =
    contestPercentile
      ? `Top ${contestPercentile}%`
      : totalAccepted >= 100
        ? "100+ Problems Milestone"
        : totalAccepted >= 50
          ? "50+ Problems Milestone"
          : totalAccepted >= 10
            ? "10+ Problems Milestone"
            : "Start Your Journey";

  const achievementSubtitle =
    contestPercentile
      ? "Your contest performance is updated from live data."
      : totalAccepted >= 10
        ? "Keep solving consistently to unlock bigger milestones."
        : "Solve more problems to unlock your first achievement.";


  // ============================================================
  const today = new Date().toDateString();

  const dailySolved = useMemo(() => {
    return submissions.filter((item) => {
      const isAccepted =
        item.status === "Accepted" ||
        item.status === "AC" ||
        item.status === "accepted";

      const submissionDate = new Date(
        item.created_at || item.submitted_at
      ).toDateString();

      return isAccepted && submissionDate === today;
    }).length;
  }, [submissions]);

  const dailyTarget =
    profile?.daily_target ??
    5;

  const dailyRemaining = Math.max(
    0,
    dailyTarget - dailySolved
  );

  const dailyProgress = dailyTarget
    ? Math.min(
      100,
      Math.round((dailySolved / dailyTarget) * 100)
    )
    : 0;
  const estimatedPracticeHours = Math.max(
    1,
    Math.round(totalSubmissions * 0.5)
  );
  const stats = [
    {
      title: "Problems Solved",
      value: problemsSolved || 0,
      icon: <CodeSlash size={22} />,
      extra: `${totalProblems || 0} total problems`,
    },

    {
      title: "Contest Ranking",
      value:
        profile?.rank ||
        profile?.global_rank ||
        profile?.rating ||
        profile?.contest_rating ||
        "N/A",
      icon: <TrophyFill size={22} />,
      extra:
        profile?.rating || profile?.contest_rating
          ? `Rating ${profile?.rating || profile?.contest_rating}`
          : "No contest data yet",
    },

    {
      title: "Submissions",
      value: acceptedCount || 0,
      icon: <BarChartFill size={22} />,
      extra: `${totalSubmissions || 0} total submissions`,
    },

    {
      title: "Practice Hours",
      value: `${estimatedPracticeHours || 0}h`,
      icon: <ClockHistory size={22} />,
      extra: `${acceptanceRate || 0}% acceptance rate`,
    },
  ];


  // =============================================================

  const getStatusBadgeClass = (status) => {
    const normalized = String(status || "").toLowerCase();

    switch (normalized) {
      case "accepted":
      case "ac":
        return "status-badge accepted";
      case "wrong answer":
      case "wa":
        return "status-badge wrong";
      default:
        return "status-badge default";
    }
  };

  const getContestBadgeClass = (type) => {
    return String(type || "").toLowerCase() === "rated"
      ? "contest-type-badge rated"
      : "contest-type-badge practice";
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  const formatContestDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatContestTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-page py-4">
          <Container>
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-3 mb-0">Loading dashboard...</p>
            </div>
          </Container>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="dashboard-page py-4">
        <Container>
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Card className="dashboard-card dashboard-hero mb-3">
            <Card.Body className="p-2 p-lg-1">
              <Row className="align-items-center g-4">
                <Col lg={8}>
                  <p className="dashboard-label text-uppercase small mb-2">
                    Welcome back
                  </p>
                  <h2 className="dashboard-title mb-2">
                    {profile?.name
                      ? `${profile.name}'s Coding Dashboard`
                      : "Your Coding Dashboard"}
                  </h2>
                  <p className="dashboard-subtitle mb-0">
                    Track your real progress, submissions, contests, and learning
                    journey from live backend data.
                  </p>
                </Col>

                <Col lg={4} className="text-lg-end">
                  <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                    <Button
                      className="dashboard-btn"
                      onClick={() => navigate("/problems")}
                    >
                      <PlayFill className="me-2" />
                      Start Practice
                    </Button>

                    <Button
                      className="dashboard-btn-outline"
                      onClick={() => navigate("/contests")}
                    >
                      View Contests
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row className="g-4 mb-4">
            {stats.map((item, index) => (
              <Col md={6} xl={3} key={index}>
                <Card className="dashboard-card stat-card">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <div className="stat-icon">
                        {React.cloneElement(item.icon, {
                          className: "theme-icon",
                        })}
                      </div>

                      <div>
                        <h3 className="stat-value mb-0">{item.value}</h3>
                        <h6 className="stat-title mb-0">{item.title}</h6>
                      </div>
                    </div>

                    <p className="stat-extra mb-0">{item.extra}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="g-4">
            <Col lg={8}>
              <Card className="dashboard-card mb-4">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="section-title mb-0">Learning Progress</h5>
                    <Badge pill className="level-badge px-3 py-2">
                      Level {profile?.level || 1}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="progress-label">Problem Completion</span>
                      <span className="progress-value">
                        {completionPercent}%
                      </span>
                    </div>
                    <ProgressBar now={completionPercent} className="custom-progress" />
                  </div>

                  <Row className="g-3">
                    <Col md={4}>
                      <div className="mini-box h-100">
                        <h6 className="mb-1">Easy</h6>
                        <p className="mb-0 text-muted-custom">{easySolved} solved</p>
                      </div>
                    </Col>

                    <Col md={4}>
                      <div className="mini-box h-100">
                        <h6 className="mb-1">Medium</h6>
                        <p className="mb-0 text-muted-custom">{mediumSolved} solved</p>
                      </div>
                    </Col>

                    <Col md={4}>
                      <div className="mini-box h-100">
                        <h6 className="mb-1">Hard</h6>
                        <p className="mb-0 text-muted-custom">{hardSolved} solved</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="dashboard-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="section-title mb-0">Recent Submissions</h5>

                    <Button
                      variant="link"
                      className="dashboard-link-btn p-0"
                      onClick={() => navigate("/submissions")}
                    >
                      View All
                    </Button>
                  </div>

                  <div className="table-responsive">
                    <Table hover className="align-middle dashboard-table mb-0">
                      <thead>
                        <tr>
                          <th>Problem</th>
                          <th>Language</th>
                          <th>Status</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentSubmissions.length > 0 ? (
                          recentSubmissions.map((item) => (
                            <tr key={item.id}>
                              <td className="fw-semibold">
                                {item.problem?.title ||
                                  item.problem_title ||
                                  `Problem #${item.problem_id || item.problem}`}
                              </td>
                              <td>{item.language || "N/A"}</td>
                              <td>
                                <span className={getStatusBadgeClass(item.status)}>
                                  {item.status || "Pending"}
                                </span>
                              </td>
                              <td className="text-muted-custom">
                                {formatTimeAgo(item.created_at || item.submitted_at)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center text-muted py-4">
                              No submissions found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="dashboard-card mb-4">
                <Card.Body>
                  <h5 className="section-title mb-3">Daily Goal</h5>

                  <div className="goal-circle text-center mb-3">
                    <h3 className="mb-1">
                      {dailySolved}/{dailyTarget}
                    </h3>
                    <p className="mb-0 text-muted-custom">
                      Problems Solved Today
                    </p>
                  </div>

                  <ProgressBar
                    now={dailyProgress}
                    className="custom-progress mb-3"
                  />

                  <p className="small text-muted-custom mb-0">
                    {dailySolved < dailyTarget
                      ? `Solve ${dailyRemaining} more problem${dailyRemaining > 1 ? "s" : ""
                      } to complete today's target.`
                      : "Daily goal completed. Great work!"}
                  </p>
                </Card.Body>
              </Card>

              <Card className="dashboard-card mb-4">
                <Card.Body>
                  <h5 className="section-title mb-3">Achievements</h5>

                  {/* Streak Achievement */}
                  <div className="achievement-item mb-3">
                    <CheckCircleFill className="achievement-icon fs-4 flex-shrink-0" />
                    <div>
                      <h6 className="fw-bold mb-1">
                        {streak} Day Streak
                      </h6>
                      <p className="mb-0 text-muted-custom">
                        Keep solving daily to maintain your streak.
                      </p>
                    </div>
                  </div>

                  {/* Problem Solving Milestone */}
                  <div className="achievement-item mb-3">
                    <CodeSlash className="achievement-icon fs-4 flex-shrink-0" />
                    <div>
                      <h6 className="fw-bold mb-1">
                        {totalAccepted >= 100
                          ? "Problem Master"
                          : totalAccepted >= 50
                            ? "Problem Solver"
                            : totalAccepted >= 10
                              ? "Getting Started"
                              : "Beginner Coder"}
                      </h6>
                      <p className="mb-0 text-muted-custom">
                        {totalAccepted} accepted submissions completed.
                      </p>
                    </div>
                  </div>

                  {/* Contest Achievement */}
                  <div className="achievement-item py-2">
                    <TrophyFill className="achievement-icon fs-4 flex-shrink-0" />
                    <div>
                      <h6 className="fw-bold mb-1">
                        {contestPercentile
                          ? `Top ${contestPercentile}%`
                          : "Contest Challenger"}
                      </h6>
                      <p className="mb-0 text-muted-custom">
                        Your contest performance is updated from live ranking.
                      </p>
                    </div>
                  </div>

                  {/* Acceptance Rate Achievement */}
                  <div className="achievement-item">
                    <BarChartFill className="achievement-icon fs-4 flex-shrink-0" />

                    <div>
                      <h6 className="fw-bold mb-1">
                        {acceptanceRate >= 80
                          ? "High Accuracy"
                          : acceptanceRate >= 50
                            ? "Consistent Performer"
                            : "Keep Improving"}
                      </h6>

                      <p className="mb-0 text-muted-custom">
                        {acceptanceRate}% submission acceptance rate.
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card className="dashboard-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="section-title mb-0">Upcoming Contests</h5>

                    <Button
                      variant="link"
                      className="dashboard-link-btn p-0"
                      onClick={() => navigate("/contests")}
                    >
                      All
                    </Button>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    {upcomingContests.length > 0 ? (
                      upcomingContests.map((contest) => (
                        <div key={contest.id} className="contest-item">
                          <div>
                            <h6 className="mb-1 fw-bold">{contest.name}</h6>
                            <p className="mb-1 text-muted-custom small">
                              {formatContestDate(contest.start_time)} •{" "}
                              {formatContestTime(contest.start_time)}
                            </p>

                            <Link
                              to={`/contest/${contest.id}`}
                              className="table-link small"
                            >
                              Join now <ArrowRight className="ms-1" />
                            </Link>
                          </div>

                          <span
                            className={getContestBadgeClass(
                              contest.type || contest.contest_type
                            )}
                          >
                            {contest.type || contest.contest_type || "Contest"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-custom mb-0">
                        No upcoming contests available.
                      </p>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

export default DashboardPage;