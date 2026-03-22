import React, { useMemo, useState } from "react";
import { Container, Row, Col, Card, Table, Badge, Form, InputGroup } from "react-bootstrap";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function LeaderboardPage() {
  const [search, setSearch] = useState("");

  const leaders = [
    { id: 1, user_name: "Abinash Das", score: 520, submissions: 18, time: "00:32:14" },
    { id: 2, user_name: "Priya Sharma", score: 500, submissions: 17, time: "00:34:40" },
    { id: 3, user_name: "Rahul Verma", score: 470, submissions: 16, time: "00:36:12" },
    { id: 4, user_name: "Sneha Patnaik", score: 430, submissions: 14, time: "00:41:08" },
    { id: 5, user_name: "Amit Kumar", score: 410, submissions: 13, time: "00:44:55" },
    { id: 6, user_name: "Neha Singh", score: 390, submissions: 12, time: "00:46:10" },
    { id: 7, user_name: "Rakesh Mohanty", score: 360, submissions: 11, time: "00:49:22" },
    { id: 8, user_name: "Pooja Das", score: 340, submissions: 10, time: "00:52:31" },
    { id: 9, user_name: "Sourav Nayak", score: 300, submissions: 9, time: "00:56:45" },
    { id: 10, user_name: "Anjali Rout", score: 280, submissions: 8, time: "01:02:18" },
  ];

  const filteredUsers = useMemo(() => {
    return leaders
      .filter((user) => user.user_name.toLowerCase().includes(search.toLowerCase()))
      .map((user) => ({
        ...user,
        rank: leaders.findIndex((u) => u.id === user.id) + 1,
      }));
  }, [search]);

  const topThree = leaders.slice(0, 3);

  return (
    <>
    <Navbar />
    <div className="leaderboard-page py-4">
      <Container>
        <Row className="align-items-center g-3 mb-4">
          <Col lg={6}>
            <div>
              <h2 className="leaderboard-title mb-1">Leaderboard</h2>
              <p className="leaderboard-subtitle mb-0">
                Contest rankings based on score and completion time
              </p>
            </div>
          </Col>

          <Col lg={6}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="leaderboard-search"
              />
            </InputGroup>
          </Col>
        </Row>

        <Row className="g-3 mb-4">
          {topThree.map((user, index) => (
            <Col md={4} key={user.id}>
              <Card className={`leaderboard-top-card h-100 top-card-${index + 1}`}>
                <Card.Body>
                  <div className="leaderboard-top-rank">
                    {index === 0 ? "🥇 Rank 1" : index === 1 ? "🥈 Rank 2" : "🥉 Rank 3"}
                  </div>
                  <h5 className="leaderboard-top-name mb-3">{user.user_name}</h5>

                  <div className="leaderboard-top-meta">
                    <span>Score: {user.score}</span>
                    <span>Submissions: {user.submissions}</span>
                    <span>Time: {user.time}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Card className="leaderboard-table-card">
          <Card.Body className="p-0">
            <Table responsive hover className="leaderboard-table mb-0 align-middle">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Score</th>
                  <th>Submissions</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <span className={`rank-pill rank-${user.rank <= 3 ? user.rank : "other"}`}>
                          #{user.rank}
                        </span>
                      </td>
                      <td className="fw-semibold">{user.user_name}</td>
                      <td>{user.score}</td>
                      <td>{user.submissions}</td>
                      <td className="text-muted-custom">{user.time}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted-custom">
                      No user found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </div>
    <Footer />
    </>
  );
}

export default LeaderboardPage;