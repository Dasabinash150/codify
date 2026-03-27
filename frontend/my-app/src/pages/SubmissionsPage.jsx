import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Badge,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
  Table,
  Button,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/SubmissionsPage.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function SubmissionsPage() {
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [problems, setProblems] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setLoading(true);
        setPageError("");

        const [submissionsRes, problemsRes] = await Promise.all([
          api.get("/submissions/").catch(() => ({ data: [] })),
          api.get("/problems/").catch(() => ({ data: [] })),
        ]);

        const submissionsData = Array.isArray(submissionsRes?.data)
          ? submissionsRes.data
          : submissionsRes?.data?.results || [];

        const problemsData = Array.isArray(problemsRes?.data)
          ? problemsRes.data
          : problemsRes?.data?.results || [];

        setSubmissions(submissionsData);
        setProblems(problemsData);
      } catch (error) {
        setPageError("Failed to load submissions.");
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  const normalizedSubmissions = useMemo(() => {
    return submissions.map((item, index) => {
      const statusRaw =
        item.status ||
        item.verdict ||
        item.result ||
        item.submission_status ||
        "Unknown";

      const normalizedStatus =
        statusRaw === "AC"
          ? "Accepted"
          : statusRaw === "WA"
          ? "Wrong Answer"
          : statusRaw === "TLE"
          ? "Time Limit Exceeded"
          : statusRaw === "RE"
          ? "Runtime Error"
          : statusRaw;

      const problem =
        item.problem_title ||
        item.problem?.title ||
        problems.find((p) => String(p.id) === String(item.problem))?.title ||
        `Problem #${item.problem || index + 1}`;

      const language =
        item.language_name ||
        item.language ||
        item.lang ||
        "Unknown";

      return {
        id: item.id || index + 1,
        rawProblemId: item.problem?.id || item.problem,
        problem,
        language,
        status: normalizedStatus,
        runtime: item.runtime || item.execution_time || "-",
        createdAt: item.created_at || item.submitted_at || null,
        memory: item.memory || item.memory_used || "-",
        code: item.code || item.source_code || "",
      };
    });
  }, [submissions, problems]);

  const languages = useMemo(() => {
    return [...new Set(normalizedSubmissions.map((item) => item.language))].filter(
      Boolean
    );
  }, [normalizedSubmissions]);

  const filteredSubmissions = useMemo(() => {
    return normalizedSubmissions
      .filter((item) => {
        const matchesSearch = item.problem
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesStatus =
          statusFilter === "all" ||
          item.status.toLowerCase() === statusFilter.toLowerCase();

        const matchesLanguage =
          languageFilter === "all" || item.language === languageFilter;

        return matchesSearch && matchesStatus && matchesLanguage;
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [normalizedSubmissions, search, statusFilter, languageFilter]);

  const summary = useMemo(() => {
    const total = normalizedSubmissions.length;
    const accepted = normalizedSubmissions.filter(
      (item) => item.status === "Accepted"
    ).length;
    const wrong = normalizedSubmissions.filter(
      (item) => item.status === "Wrong Answer"
    ).length;
    const tle = normalizedSubmissions.filter(
      (item) => item.status === "Time Limit Exceeded"
    ).length;

    return { total, accepted, wrong, tle };
  }, [normalizedSubmissions]);

  const getStatusBadge = (status) => {
    const value = String(status).toLowerCase();

    if (value === "accepted") {
      return <Badge bg="success">Accepted</Badge>;
    }
    if (value === "wrong answer") {
      return <Badge bg="danger">Wrong Answer</Badge>;
    }
    if (value === "time limit exceeded") {
      return (
        <Badge bg="warning" text="dark">
          TLE
        </Badge>
      );
    }
    if (value === "runtime error") {
      return <Badge bg="dark">Runtime Error</Badge>;
    }
    return <Badge bg="secondary">{status}</Badge>;
  };

  return (
    <>
      <Navbar />

      <div className="submissions-page py-4">
        <Container>
          {pageError && (
            <Alert variant="danger" className="mb-4">
              {pageError}
            </Alert>
          )}

          <Card className="submissions-card submissions-hero border-0 mb-4">
            <Card.Body className="p-4">
              <h2 className="submissions-title mb-2 fw-bold">My Submissions</h2>
              <p className="submissions-subtitle mb-0">
                Review your recent runs, accepted solutions, and failed attempts.
              </p>
            </Card.Body>
          </Card>

          <Row className="g-4 mb-4">
            <Col md={6} xl={3}>
              <Card className="submissions-card summary-card border-0 h-100">
                <Card.Body>
                  <p className="summary-label mb-2">Total</p>
                  <h3 className="summary-value mb-0">{summary.total}</h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} xl={3}>
              <Card className="submissions-card summary-card border-0 h-100">
                <Card.Body>
                  <p className="summary-label mb-2">Accepted</p>
                  <h3 className="summary-value mb-0">{summary.accepted}</h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} xl={3}>
              <Card className="submissions-card summary-card border-0 h-100">
                <Card.Body>
                  <p className="summary-label mb-2">Wrong Answer</p>
                  <h3 className="summary-value mb-0">{summary.wrong}</h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} xl={3}>
              <Card className="submissions-card summary-card border-0 h-100">
                <Card.Body>
                  <p className="summary-label mb-2">TLE</p>
                  <h3 className="summary-value mb-0">{summary.tle}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="submissions-card border-0 mb-4">
            <Card.Body>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Search by problem..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="submissions-input"
                  />
                </Col>

                <Col md={4}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="submissions-input"
                  >
                    <option value="all">All Status</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Wrong Answer">Wrong Answer</option>
                    <option value="Time Limit Exceeded">Time Limit Exceeded</option>
                    <option value="Runtime Error">Runtime Error</option>
                  </Form.Select>
                </Col>

                <Col md={4}>
                  <Form.Select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="submissions-input"
                  >
                    <option value="all">All Languages</option>
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="submissions-card border-0">
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle submissions-table mb-0">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Problem</th>
                        <th>Language</th>
                        <th>Status</th>
                        <th>Runtime</th>
                        <th>Submitted</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.length > 0 ? (
                        filteredSubmissions.map((item) => (
                          <tr key={item.id}>
                            <td className="fw-semibold">#{item.id}</td>
                            <td>{item.problem}</td>
                            <td>{item.language}</td>
                            <td>{getStatusBadge(item.status)}</td>
                            <td>{item.runtime}</td>
                            <td>{formatDateTime(item.createdAt)}</td>
                            <td>
                              {item.rawProblemId ? (
                                <Button
                                  as={Link}
                                  to={`/problems/${item.rawProblemId}`}
                                  size="sm"
                                  variant="outline-primary"
                                >
                                  Open Problem
                                </Button>
                              ) : (
                                <span className="text-muted">N/A</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-5 text-muted">
                            No submissions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>
    </>
  );
}

function formatDateTime(dateString) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return date.toLocaleString();
}

export default SubmissionsPage;