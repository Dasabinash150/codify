import React, { useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Form,
  InputGroup,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import "../styles/ContestListPage.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function ContestListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const contests = [
    {
      id: 1,
      title: "Weekly Coding Challenge 12",
      description: "Solve 4 carefully selected problems in 60 minutes.",
      status: "Live",
      difficulty: "Mixed",
      participants: 1248,
      problems: 4,
      duration: "60 min",
      startTime: "Today, 11:30 AM",
    },
    {
      id: 2,
      title: "Beginner Speed Run",
      description: "Easy and beginner-friendly contest for fast problem solving.",
      status: "Upcoming",
      difficulty: "Easy",
      participants: 860,
      problems: 5,
      duration: "90 min",
      startTime: "Today, 5:00 PM",
    },
    {
      id: 3,
      title: "Algorithm Arena 8",
      description: "Test your algorithmic thinking with medium and hard problems.",
      status: "Live",
      difficulty: "Hard",
      participants: 2150,
      problems: 6,
      duration: "120 min",
      startTime: "Today, 10:00 AM",
    },
    {
      id: 4,
      title: "Weekend Contest Special",
      description: "Mixed-level contest focused on arrays, strings, and graphs.",
      status: "Ended",
      difficulty: "Medium",
      participants: 3412,
      problems: 5,
      duration: "90 min",
      startTime: "Yesterday, 7:00 PM",
    },
    {
      id: 5,
      title: "Data Structures Marathon",
      description: "A contest focused on linked list, stack, queue, tree, and heap.",
      status: "Upcoming",
      difficulty: "Medium",
      participants: 990,
      problems: 7,
      duration: "150 min",
      startTime: "Tomorrow, 9:00 AM",
    },
    {
      id: 6,
      title: "Night Owl Coding Battle",
      description: "Late-night challenge with strong competition and ranking.",
      status: "Ended",
      difficulty: "Mixed",
      participants: 1780,
      problems: 4,
      duration: "75 min",
      startTime: "Last Sunday, 10:00 PM",
    },
  ];

  const filteredContests = useMemo(() => {
    return contests.filter((contest) => {
      const matchesSearch =
        contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contest.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || contest.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const getStatusBadge = (status) => {
    if (status === "Live") return "danger";
    if (status === "Upcoming") return "warning";
    return "secondary";
  };

  const getDifficultyClass = (difficulty) => {
    if (difficulty === "Easy") return "difficulty-easy";
    if (difficulty === "Medium") return "difficulty-medium";
    if (difficulty === "Hard") return "difficulty-hard";
    return "difficulty-mixed";
  };

  return (
    <>
      <Navbar />
      <div className="contest-list-page py-4 py-lg-5">
        <Container>
          <div className="contest-list-hero mb-4 mb-lg-5">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
              <div>
                <p className="contest-list-label mb-2">Coding Contests</p>
                <h1 className="contest-list-title mb-2">Explore all contests</h1>
                <p className="contest-list-subtitle mb-0">
                  Join live contests, prepare for upcoming events, and review past challenges.
                </p>
              </div>

              <div className="contest-list-summary">
                <div className="summary-box">
                  <span className="summary-value">{contests.length}</span>
                  <span className="summary-label">Total Contests</span>
                </div>
                <div className="summary-box">
                  <span className="summary-value">
                    {contests.filter((c) => c.status === "Live").length}
                  </span>
                  <span className="summary-label">Live Now</span>
                </div>
              </div>
            </div>
          </div>

          <Card className="contest-filter-card mb-4">
            <Card.Body>
              <Row className="g-3 align-items-center">
                <Col lg={8}>
                  <InputGroup>
                    <InputGroup.Text className="contest-input-icon">
                      Search
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search contest by title or description"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="contest-input"
                    />
                  </InputGroup>
                </Col>

                <Col lg={4}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="contest-select"
                  >
                    <option value="All">All Status</option>
                    <option value="Live">Live</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ended">Ended</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row className="g-4">
            {filteredContests.map((contest) => (
              <Col md={6} xl={4} key={contest.id}>
                <Card className="contest-card h-100">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                      <Badge bg={getStatusBadge(contest.status)} className="contest-status-badge">
                        {contest.status}
                      </Badge>

                      <span className={`contest-difficulty ${getDifficultyClass(contest.difficulty)}`}>
                        {contest.difficulty}
                      </span>
                    </div>

                    <h4 className="contest-card-title mb-2">{contest.title}</h4>
                    <p className="contest-card-desc mb-3">{contest.description}</p>

                    <div className="contest-meta-grid mb-4">
                      <div className="meta-item">
                        <span className="meta-label">Problems</span>
                        <span className="meta-value">{contest.problems}</span>
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">Participants</span>
                        <span className="meta-value">{contest.participants}</span>
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">Duration</span>
                        <span className="meta-value">{contest.duration}</span>
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">Start</span>
                        <span className="meta-value">{contest.startTime}</span>
                      </div>
                    </div>

                    <div className="contest-actions mt-auto">
                      <Button
                        as={Link}
                        to={`/contest/${contest.id}`}
                        className="contest-btn-primary"
                      >
                        View
                      </Button>

                      <Button
                        as={Link}
                        to={`/contest/${contest.id}/leaderboard`}
                        className="contest-btn-outline"
                      >
                        Leaderboard
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {filteredContests.length === 0 && (
            <Card className="contest-empty-card mt-4">
              <Card.Body className="text-center py-5">
                <h5 className="mb-2">No contests found</h5>
                <p className="text-muted-custom mb-0">
                  Try changing the search text or filter option.
                </p>
              </Card.Body>
            </Card>
          )}
        </Container>
      </div>
      <Footer />
    </>
  );
}

export default ContestListPage;