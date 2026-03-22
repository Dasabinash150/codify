import React from "react";
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
} from "react-bootstrap-icons";

import Navbar from "../components/Navbar"
function DashboardPage() {
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
      problem: "Two Sum",
      language: "Python",
      status: "Accepted",
      time: "2 hours ago",
    },
    {
      problem: "Valid Parentheses",
      language: "JavaScript",
      status: "Accepted",
      time: "5 hours ago",
    },
    {
      problem: "Merge Intervals",
      language: "Python",
      status: "Wrong Answer",
      time: "Yesterday",
    },
    {
      problem: "Binary Search",
      language: "C++",
      status: "Accepted",
      time: "Yesterday",
    },
  ];

  const upcomingContests = [
    {
      name: "Weekly Contest 21",
      date: "24 Mar 2026",
      time: "8:00 PM",
      type: "Rated",
    },
    {
      name: "Beginner Challenge",
      date: "26 Mar 2026",
      time: "6:30 PM",
      type: "Practice",
    },
    {
      name: "Algorithm Sprint",
      date: "29 Mar 2026",
      time: "9:00 PM",
      type: "Rated",
    },
  ];

  return (
    <>
  <Navbar />
    <div className="dashboard-page py-4">
      <Container>
        {/* Header */}
        <div className="dashboard-hero mb-4">
          <Row className="align-items-center g-4">
            <Col lg={8}>
              <p className="dashboard-label mb-2">Welcome back</p>
              <h2 className="dashboard-title mb-2">Your Coding Dashboard</h2>
              <p className="dashboard-subtitle mb-0">
                Track progress, improve ranking, and stay consistent with your
                daily practice.
              </p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <Button className="dashboard-btn me-2">
                <PlayFill className="me-2" />
                Start Practice
              </Button>
              <Button variant="outline-light" className="dashboard-btn-outline">
                View Contests
              </Button>
            </Col>
          </Row>
        </div>

        {/* Stats */}
        <Row className="g-4 mb-4">
          {stats.map((item, index) => (
            <Col md={6} xl={3} key={index}>
              <Card className="dashboard-card stat-card h-100 border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="stat-icon">{item.icon}</div>
                  </div>
                  <h6 className="stat-title">{item.title}</h6>
                  <h3 className="stat-value">{item.value}</h3>
                  <p className="stat-extra mb-0">{item.extra}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="g-4">
          {/* Progress */}
          <Col lg={8}>
            <Card className="dashboard-card border-0 mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="section-title mb-0">Learning Progress</h5>
                  <Badge bg="light" text="dark" pill>
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
                    <div className="mini-box">
                      <h6>Easy</h6>
                      <p className="mb-0">74 solved</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="mini-box">
                      <h6>Medium</h6>
                      <p className="mb-0">42 solved</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="mini-box">
                      <h6>Hard</h6>
                      <p className="mb-0">12 solved</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Recent Submissions */}
            <Card className="dashboard-card border-0">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="section-title mb-0">Recent Submissions</h5>
                  <Button variant="link" className="table-link p-0">
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
                      {recentSubmissions.map((item, index) => (
                        <tr key={index}>
                          <td>{item.problem}</td>
                          <td>{item.language}</td>
                          <td>
                            <Badge
                              bg={
                                item.status === "Accepted"
                                  ? "success"
                                  : "danger"
                              }
                              className="px-3 py-2"
                            >
                              {item.status}
                            </Badge>
                          </td>
                          <td>{item.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Right side */}
          <Col lg={4}>
            <Card className="dashboard-card border-0 mb-4">
              <Card.Body>
                <h5 className="section-title mb-3">Daily Goal</h5>
                <div className="goal-circle mb-3">
                  <h3>3/5</h3>
                  <p className="mb-0">Problems</p>
                </div>
                <ProgressBar now={60} className="custom-progress mb-3" />
                <p className="small-muted mb-0">
                  Solve 2 more problems to complete today’s target.
                </p>
              </Card.Body>
            </Card>

            <Card className="dashboard-card border-0 mb-4">
              <Card.Body>
                <h5 className="section-title mb-3">Achievements</h5>
                <div className="achievement-item">
                  <CheckCircleFill className="achievement-icon" />
                  <div>
                    <h6>7 Day Streak</h6>
                    <p className="mb-0">You practiced every day this week.</p>
                  </div>
                </div>
                <div className="achievement-item">
                  <TrophyFill className="achievement-icon" />
                  <div>
                    <h6>Top 20%</h6>
                    <p className="mb-0">Great ranking in recent contests.</p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="dashboard-card border-0">
              <Card.Body>
                <h5 className="section-title mb-3">Upcoming Contests</h5>
                {upcomingContests.map((contest, index) => (
                  <div className="contest-item" key={index}>
                    <div>
                      <h6 className="mb-1">{contest.name}</h6>
                      <p className="mb-1">
                        {contest.date} • {contest.time}
                      </p>
                    </div>
                    <Badge
                      bg={contest.type === "Rated" ? "warning" : "info"}
                      text="dark"
                    >
                      {contest.type}
                    </Badge>
                  </div>
                ))}
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