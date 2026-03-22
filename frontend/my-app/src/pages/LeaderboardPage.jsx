import React from "react";
import { Container, Row, Col, Card, Table, Badge, Form, InputGroup, Button } from "react-bootstrap";
import { Search, Trophy, Award, Funnel } from "react-bootstrap-icons";
import TopPodium from "../components/TopPodium";
import "../styles/LeaderBoardPage.css";

const leaderboardData = [
  { rank: 1, name: "Abinash Das", username: "abinash", solved: 245, score: 1980, streak: 32 },
  { rank: 2, name: "Rahul Sharma", username: "rahul", solved: 231, score: 1890, streak: 26 },
  { rank: 3, name: "Priya Singh", username: "priya", solved: 220, score: 1815, streak: 21 },
  { rank: 4, name: "Amit Kumar", username: "amit", solved: 210, score: 1750, streak: 18 },
  { rank: 5, name: "Neha Patel", username: "neha", solved: 202, score: 1695, streak: 16 },
  { rank: 6, name: "Sourav Das", username: "sourav", solved: 197, score: 1650, streak: 14 },
  { rank: 7, name: "Anjali Roy", username: "anjali", solved: 188, score: 1598, streak: 11 },
  { rank: 8, name: "Rakesh Jena", username: "rakesh", solved: 176, score: 1512, streak: 10 },
];

function getRankBadge(rank) {
  if (rank === 1) return <Trophy className="me-1" />;
//   if (rank === 2) return <Medal className="me-1" />;
  if (rank === 3) return <Award className="me-1" />;
  return null;
}

function LeaderboardPage() {
  return (
    <div className="leaderboard-page py-4 py-md-5">
      <Container>
        {/* Header */}
        <div className="page-hero mb-4">
          <Row className="align-items-center g-3">
            <Col lg={8}>
              <Badge className="hero-badge mb-3">Competitive Rankings</Badge>
              <h2 className="page-title mb-2">Leaderboard</h2>
              <p className="page-subtitle mb-0">
                Track top performers, compare scores, and stay motivated with real-time rankings.
              </p>
            </Col>
            <Col lg={4}>
              <Card className="summary-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="summary-label">Top Score</span>
                    <Trophy size={22} />
                  </div>
                  <h3 className="summary-value mb-1">1980</h3>
                  <p className="summary-text mb-0">Highest score this week</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Stats */}
        <Row className="g-3 mb-4">
          <Col md={4}>
            <Card className="stat-card">
              <Card.Body>
                <p className="stat-label mb-1">Active Participants</p>
                <h4 className="stat-value mb-0">1,248</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stat-card">
              <Card.Body>
                <p className="stat-label mb-1">Problems Solved Today</p>
                <h4 className="stat-value mb-0">3,582</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stat-card">
              <Card.Body>
                <p className="stat-label mb-1">Average Score</p>
                <h4 className="stat-value mb-0">1,426</h4>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <TopPodium />
        {/* Filters */}
        <Card className="table-card mb-4">
          <Card.Body>
            <Row className="g-3 align-items-center">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text className="filter-icon">
                    <Search />
                  </InputGroup.Text>
                  <Form.Control placeholder="Search by name or username" />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Select>
                  <option>All Time</option>
                  <option>This Month</option>
                  <option>This Week</option>
                  <option>Today</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Button className="filter-btn w-100">
                  <Funnel className="me-2" />
                  Apply Filters
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Leaderboard Table */}
        <Card className="table-card">
          <Card.Body>
            <div className="table-responsive">
              <Table hover className="align-middle leaderboard-table mb-0">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>User</th>
                    <th>Solved</th>
                    <th>Score</th>
                    <th>Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((user) => (
                    <tr key={user.rank}>
                      <td>
                        <span className={`rank-badge rank-${user.rank <= 0 ? user.rank : "default"}`}>
                          {getRankBadge(user.rank)}
                          #{user.rank}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold text-light">{user.name}</div>
                        <small className="text-secondary">@{user.username}</small>
                      </td>
                      <td>{user.solved}</td>
                      <td>
                        <Badge bg="" className="score-badge">
                          {user.score}
                        </Badge>
                      </td>
                      <td>{user.streak} days</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default LeaderboardPage;