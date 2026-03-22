import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Form,
  InputGroup,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import "../styles/ContestListPage.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getContests } from "../services/contestApi";


function ContestListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchContests = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getContests();
        setContests(res.data);
        console.log("Contest API:", res.data);
        console.log("Is array:", Array.isArray(res.data));

        if (isMounted) {
          const data = Array.isArray(res.data) ? res.data : [];
          setContests(data);
        }
      } catch (err) {
        console.error("Contest fetch error:", err);
        if (isMounted) {
          setError("Failed to load contests. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchContests();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredContests = useMemo(() => {
    return contests.filter((contest) => {
      const title = contest.title || "";
      const description = contest.description || "";
      const status = contest.status || "";

      const matchesSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contests, searchTerm, statusFilter]);

  const liveCount = useMemo(() => {
    return contests.filter((contest) => contest.status === "Live").length;
  }, [contests]);

  const getStatusBadge = (status) => {
    if (status === "Live") return "danger";
    if (status === "Upcoming") return "warning";
    if (status === "Ended") return "secondary";
    return "primary";
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
                  <span className="summary-value">{liveCount}</span>
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

          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-3 mb-0">Loading contests...</p>
            </div>
          )}

          {!loading && error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {!loading && !error && (
            <>
              <Row className="g-4">
                {filteredContests.map((contest) => (
                  <Col md={6} xl={4} key={contest.id}>
                    <Card className="contest-card h-100">
                      <Card.Body className="d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                          <Badge
                            bg={getStatusBadge(contest.status)}
                            className="contest-status-badge"
                          >
                            {contest.status || "Unknown"}
                          </Badge>

                          <span
                            className={`contest-difficulty ${getDifficultyClass(
                              contest.difficulty
                            )}`}
                          >
                            {contest.difficulty || "Mixed"}
                          </span>
                        </div>

                        <h4 className="contest-card-title mb-2">
                          {contest.name || "Untitled Contest"}
                        </h4>

                        <p className="contest-card-desc mb-3">
                          {contest.description || "No description available."}
                        </p>

                        <div className="contest-meta-grid mb-4">
                          <div className="meta-item">
                            <span className="meta-label">Problems</span>
                            <span className="meta-value">{contest.problems_count ?? 0}</span>
                          </div>

                          <div className="meta-item">
                            <span className="meta-label">Participants</span>
                            <span className="meta-value">{contest.participants_count ?? 0}</span>
                          </div>

                          <div className="meta-item">
                            <span className="meta-label">Duration</span>
                            <span className="meta-value">
                              {contest.start_time && contest.end_time
                                ? `${Math.round(
                                  (new Date(contest.end_time) - new Date(contest.start_time)) / 60000
                                )} min`
                                : "N/A"}
                            </span>
                          </div>

                          <div className="meta-item">
                            <span className="meta-label">Start</span>
                            <span className="meta-value">
                              {contest.start_time || contest.startTime || "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto d-flex gap-2">
                          <Button
                            as={Link}
                            to={`/contest/${contest.id}`}
                            variant="primary"
                            className="contest-primary-btn w-100"
                          >
                            View Details
                          </Button>

                          <Button
                            as={Link}
                            to={`/contest/${contest.id}/leaderboard`}
                            variant="outline-primary"
                            className="contest-outline-btn"
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
            </>
          )}
        </Container>
      </div>

      <Footer />
    </>
  );
}

export default ContestListPage;