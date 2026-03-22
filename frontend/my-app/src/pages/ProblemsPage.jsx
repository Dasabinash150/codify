import React, { useMemo, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Table,
    Form,
    Badge,
    InputGroup,
    Button,
    ProgressBar,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import "../styles/ProblemsPage.css";
import "../styles/global.css";
import "../styles/variables.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const problemData = [
    {
        id: 1,
        title: "Two Sum",
        difficulty: "Easy",
        category: "Array",
        acceptance: "49%",
        status: "Solved",
        tags: ["Array", "HashMap"],
    },
    {
        id: 2,
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        category: "String",
        acceptance: "38%",
        status: "Attempted",
        tags: ["String", "Sliding Window"],
    },
    {
        id: 3,
        title: "Median of Two Sorted Arrays",
        difficulty: "Hard",
        category: "Binary Search",
        acceptance: "31%",
        status: "Unsolved",
        tags: ["Binary Search"],
    },
    {
        id: 4,
        title: "Best Time to Buy and Sell Stock",
        difficulty: "Easy",
        category: "Greedy",
        acceptance: "54%",
        status: "Solved",
        tags: ["Array", "Greedy"],
    },
    {
        id: 5,
        title: "Word Break",
        difficulty: "Medium",
        category: "DP",
        acceptance: "42%",
        status: "Unsolved",
        tags: ["Dynamic Programming", "String"],
    },
    {
        id: 6,
        title: "Merge K Sorted Lists",
        difficulty: "Hard",
        category: "Heap",
        acceptance: "36%",
        status: "Attempted",
        tags: ["Linked List", "Heap"],
    },
];

const ProblemsPage = () => {
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("All");
    const [status, setStatus] = useState("All");

    const filteredProblems = useMemo(() => {
        return problemData.filter((problem) => {
            const matchesSearch =
                problem.title.toLowerCase().includes(search.toLowerCase()) ||
                problem.tags.join(" ").toLowerCase().includes(search.toLowerCase());

            const matchesDifficulty =
                difficulty === "All" || problem.difficulty === difficulty;

            const matchesStatus = status === "All" || problem.status === status;

            return matchesSearch && matchesDifficulty && matchesStatus;
        });
    }, [search, difficulty, status]);

    const solvedCount = problemData.filter((p) => p.status === "Solved").length;
    const progress = Math.round((solvedCount / problemData.length) * 100);

    return (
        <>
            <Navbar />
            <div className="problems-page">
                <Container fluid="lg" className="py-4">
                    <div className="problems-hero mb-4">
                        <Row className="align-items-center g-3">
                            <Col lg={8}>
                                <p className="problems-eyebrow mb-2">Practice Arena</p>
                                <h1 className="problems-title mb-2">Problems</h1>
                                <p className="text-muted-custom mb-0">
                                    Solve curated coding problems, track progress, and prepare for
                                    contests and interviews.
                                </p>
                            </Col>

                            <Col lg={4}>
                                <Card className="stat-card progress-card h-100">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-muted-custom">Solved Progress</span>
                                            <span className="fw-semibold">{progress}%</span>
                                        </div>

                                        <ProgressBar now={progress} className="problems-progress mb-3" />

                                        <div className="d-flex justify-content-between small">
                                            <span className="text-muted-custom">
                                                {solvedCount} / {problemData.length} solved
                                            </span>
                                            <span className="text-muted-custom">Keep going</span>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </div>

                    <Row className="g-3 mb-4">
                        <Col md={4}>
                            <Card className="stat-card h-100">
                                <Card.Body>
                                    <p className="text-muted-custom mb-1">Total Problems</p>
                                    <h3 className="mb-0 fw-bold">{problemData.length}</h3>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={4}>
                            <Card className="stat-card h-100">
                                <Card.Body>
                                    <p className="text-muted-custom mb-1">Solved</p>
                                    <h3 className="mb-0 fw-bold">{solvedCount}</h3>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={4}>
                            <Card className="stat-card h-100">
                                <Card.Body>
                                    <p className="text-muted-custom mb-1">Showing</p>
                                    <h3 className="mb-0 fw-bold">{filteredProblems.length}</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Card className="problems-filter-card mb-4">
                        <Card.Body>
                            <Row className="g-3 align-items-center">
                                <Col lg={5}>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by title or tag"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>

                                <Col sm={6} lg={3}>
                                    <Form.Select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                    >
                                        <option value="All">All Difficulty</option>
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </Form.Select>
                                </Col>

                                <Col sm={6} lg={3}>
                                    <Form.Select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Solved">Solved</option>
                                        <option value="Attempted">Attempted</option>
                                        <option value="Unsolved">Unsolved</option>
                                    </Form.Select>
                                </Col>

                                <Col lg={1} className="d-grid">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => {
                                            setSearch("");
                                            setDifficulty("All");
                                            setStatus("All");
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="problems-table-card">
                        <Card.Body className="p-0">
                            <Table responsive hover className="problems-table mb-0 align-middle">
                                <thead>
                                    <tr>
                                        <th style={{ width: "70px" }}>#</th>
                                        <th>Problem</th>
                                        <th>Difficulty</th>
                                        <th>Category</th>
                                        <th>Acceptance</th>
                                        <th>Status</th>
                                        <th style={{ width: "120px" }}>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredProblems.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5 text-muted-custom">
                                                No problems found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProblems.map((problem, index) => (
                                            <tr key={problem.id}>
                                                <td className="fw-semibold">{index + 1}</td>

                                                <td>
                                                    <div className="problem-title-wrap">
                                                        <Link
                                                            to={`/problems/${problem.id}`}
                                                            className="problem-title-link"
                                                        >
                                                            {problem.title}
                                                        </Link>

                                                        <div className="mt-2 d-flex flex-wrap gap-2">
                                                            {problem.tags.map((tag) => (
                                                                <span key={tag} className="tag-pill">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <Badge
                                                        className={`difficulty-badge difficulty-${problem.difficulty.toLowerCase()}`}
                                                    >
                                                        {problem.difficulty}
                                                    </Badge>
                                                </td>

                                                <td>
                                                    <span className="category-pill">{problem.category}</span>
                                                </td>

                                                <td className="fw-medium">{problem.acceptance}</td>

                                                <td>
                                                    <Badge
                                                        className={`status-badge status-${problem.status.toLowerCase()}`}
                                                    >
                                                        {problem.status}
                                                    </Badge>
                                                </td>

                                                <td>
                                                    <Button
                                                        as={Link}
                                                        to={`/problems/${problem.id}`}
                                                        size="sm"
                                                        className="btn-primary-custom"
                                                    >
                                                        Solve
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
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
};

export default ProblemsPage;