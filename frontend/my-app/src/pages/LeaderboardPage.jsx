import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  InputGroup,
  Spinner,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useContestSocket from "../hooks/useContestSocket";

const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function LeaderboardPage() {
  const { id } = useParams();
  const [leaders, setLeaders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, [id]);
  useContestSocket(id, (msg) => {
    if (msg.event === "leaderboard_update") {
      fetchLeaderboard();
    }
  });
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access");

      const response = await axios.get(`${API}/api/leaderboard/${id}/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data.results || response.data.data || [];

      const ranked = rawData.map((item, index) => ({
        id: item.id || index + 1,
        user_name:
          item.user_name ||
          item.username ||
          item.user?.name ||
          item.user?.username ||
          item.user?.email ||
          "Unknown",
        score: item.score ?? 0,
        submissions: item.submissions ?? 0,
        time: item.time || item.total_time || "00:00:00",
        rank: index + 1,
      }));

      setLeaders(ranked);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return leaders.filter((u) =>
      (u.user_name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [leaders, search]);

  const topThree = leaders.slice(0, 3);
  useContestSocket(id, (msg) => {

    if (msg.event === "leaderboard_update") {
      fetchLeaderboard();
    }

  });

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

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <>
              <Row className="g-3 mb-4">
                {topThree.map((user, index) => (
                  <Col md={4} key={user.id}>
                    <Card className={`leaderboard-top-card h-100 top-card-${index + 1}`}>
                      <Card.Body>
                        <div className="leaderboard-top-rank">
                          {index === 0
                            ? "🥇 Rank 1"
                            : index === 1
                              ? "🥈 Rank 2"
                              : "🥉 Rank 3"}
                        </div>

                        <h5 className="leaderboard-top-name mb-3">
                          {user.user_name}
                        </h5>

                        <div className="leaderboard-top-meta d-flex flex-column gap-2">
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
                    <thead className="fw-bold fs-5">
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
                              <span
                                className={`rank-pill rank-${user.rank <= 3 ? user.rank : "other"
                                  }`}
                              >
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
            </>
          )}
        </Container>
      </div>

      <Footer />
    </>
  );
}

export default LeaderboardPage;