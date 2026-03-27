import React from "react";
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
import "../styles/DashboardPage.css";

function DashboardPage() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Problems Solved",
      value: 128,
      icon: <CodeSlash size={22} />,
      extra: "12 solved this week",
    },
    {
      title: "Contest Rating",
      value: 1540,
      icon: <TrophyFill size={22} />,
      extra: "+45 this month",
    },
    {
      title: "Submissions",
      value: 342,
      icon: <BarChartFill size={22} />,
      extra: "87% acceptance rate",
    },
    {
      title: "Practice Hours",
      value: "46h",
      icon: <ClockHistory size={22} />,
      extra: "4h this week",
    },
  ];

  const recentSubmissions = [
    {
      id: 1,
      problem: "Two Sum",
      language: "Python",
      status: "Accepted",
      time: "2 hours ago",
    },
    {
      id: 2,
      problem: "Valid Parentheses",
      language: "JavaScript",
      status: "Accepted",
      time: "5 hours ago",
    },
    {
      id: 3,
      problem: "Merge Intervals",
      language: "Python",
      status: "Wrong Answer",
      time: "Yesterday",
    },
    {
      id: 4,
      problem: "Binary Search",
      language: "C++",
      status: "Accepted",
      time: "Yesterday",
    },
  ];

  const upcomingContests = [
    {
      id: 1,
      name: "Weekly Contest 21",
      date: "24 Mar 2026",
      time: "8:00 PM",
      type: "Rated",
    },
    {
      id: 2,
      name: "Beginner Challenge",
      date: "26 Mar 2026",
      time: "6:30 PM",
      type: "Practice",
    },
    {
      id: 3,
      name: "Algorithm Sprint",
      date: "29 Mar 2026",
      time: "9:00 PM",
      type: "Rated",
    },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Accepted":
        return "status-badge accepted";
      case "Wrong Answer":
        return "status-badge wrong";
      default:
        return "status-badge default";
    }
  };

  const getContestBadgeClass = (type) => {
    return type === "Rated"
      ? "contest-type-badge rated"
      : "contest-type-badge practice";
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-page py-4">
        <Container>
          <Card className="dashboard-card dashboard-hero mb-4">
            <Card.Body className="p-4 p-lg-5">
              <Row className="align-items-center g-4">
                <Col lg={8}>
                  <p className="dashboard-label text-uppercase small mb-2">
                    Welcome back
                  </p>
                  <h2 className="dashboard-title mb-2">Your Coding Dashboard</h2>
                  <p className="dashboard-subtitle mb-0">
                    Track your progress, improve ranking, and stay consistent
                    with daily practice and contests.
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
                <Card className="dashboard-card stat-card h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="stat-icon">
                        {React.cloneElement(item.icon, {
                          className: "theme-icon",
                        })}
                      </div>
                    </div>

                    <h6 className="stat-title mb-2">{item.title}</h6>
                    <h3 className="stat-value mb-1">{item.value}</h3>
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
                      Level 4
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="progress-label">DSA Sheet Completion</span>
                      <span className="progress-value">68%</span>
                    </div>
                    <ProgressBar now={68} className="custom-progress" />
                  </div>

                  <Row className="g-3">
                    <Col md={4}>
                      <div className="mini-box h-100">
                        <h6 className="mb-1">Easy</h6>
                        <p className="mb-0 text-muted-custom">74 solved</p>
                      </div>
                    </Col>

                    <Col md={4}>
                      <div className="mini-box h-100">
                        <h6 className="mb-1">Medium</h6>
                        <p className="mb-0 text-muted-custom">42 solved</p>
                      </div>
                    </Col>

                    <Col md={4}>
                      <div className="mini-box h-100">
                        <h6 className="mb-1">Hard</h6>
                        <p className="mb-0 text-muted-custom">12 solved</p>
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
                        {recentSubmissions.map((item) => (
                          <tr key={item.id}>
                            <td className="fw-semibold">{item.problem}</td>
                            <td>{item.language}</td>
                            <td>
                              <span className={getStatusBadgeClass(item.status)}>
                                {item.status}
                              </span>
                            </td>
                            <td className="text-muted-custom">{item.time}</td>
                          </tr>
                        ))}
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
                    <h3 className="mb-1">3/5</h3>
                    <p className="mb-0 text-muted-custom">Problems</p>
                  </div>

                  <ProgressBar now={60} className="custom-progress mb-3" />

                  <p className="small text-muted-custom mb-0">
                    Solve 2 more problems to complete today’s target.
                  </p>
                </Card.Body>
              </Card>

              <Card className="dashboard-card mb-4">
                <Card.Body>
                  <h5 className="section-title mb-3">Achievements</h5>

                  <div className="achievement-item mb-3">
                    <CheckCircleFill className="achievement-icon fs-4 flex-shrink-0" />
                    <div>
                      <h6 className="fw-bold mb-1">7 Day Streak</h6>
                      <p className="mb-0 text-muted-custom">
                        You practiced every day this week.
                      </p>
                    </div>
                  </div>

                  <div className="achievement-item">
                    <TrophyFill className="achievement-icon fs-4 flex-shrink-0" />
                    <div>
                      <h6 className="fw-bold mb-1">Top 20%</h6>
                      <p className="mb-0 text-muted-custom">
                        Great ranking in recent contests.
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
                    {upcomingContests.map((contest) => (
                      <div key={contest.id} className="contest-item">
                        <div>
                          <h6 className="mb-1 fw-bold">{contest.name}</h6>
                          <p className="mb-1 text-muted-custom small">
                            {contest.date} • {contest.time}
                          </p>

                          <Link to="/contests" className="table-link small">
                            Join now <ArrowRight className="ms-1" />
                          </Link>
                        </div>

                        <span className={getContestBadgeClass(contest.type)}>
                          {contest.type}
                        </span>
                      </div>
                    ))}
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