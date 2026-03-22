import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

const topUsers = [
  { rank: 2, name: "Rahul Sharma", score: 1890 },
  { rank: 1, name: "Abinash Das", score: 1980 },
  { rank: 3, name: "Priya Singh", score: 1815 },
];

function PodiumCard({ user }) {
  return (
    <Card className={`podium-card rank-${user.rank}`}>
      <Card.Body className="text-center">
        <div className="podium-rank">#{user.rank}</div>

        <div className="podium-avatar">
          {user.name.charAt(0)}
        </div>

        <h5 className="podium-name">{user.name}</h5>

        <p className="podium-score">{user.score}</p>
      </Card.Body>
    </Card>
  );
}

function TopPodium() {
  return (
    <Container className="mb-5">
      <Row className="justify-content-center align-items-end g-3">

        {/* Rank 2 */}
        <Col md={3}>
          <PodiumCard user={topUsers[0]} />
        </Col>

        {/* Rank 1 */}
        <Col md={3}>
          <PodiumCard user={topUsers[1]} />
        </Col>

        {/* Rank 3 */}
        <Col md={3}>
          <PodiumCard user={topUsers[2]} />
        </Col>

      </Row>
    </Container>
  );
}

export default TopPodium;