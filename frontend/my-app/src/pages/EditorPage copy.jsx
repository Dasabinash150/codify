import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Dropdown, DropdownButton, Card } from "react-bootstrap";
import Editor from "@monaco-editor/react";
import { useNavigate, useParams } from "react-router-dom"; // ✅ import hooks

const questions = [
    {
        id: 1,
        title: "Two Sum",
        description: "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
        constraints: "1 <= nums.length <= 10^4",
    },
    {
        id: 2,
        title: "Reverse String",
        description: "Write a function that reverses a string.",
        constraints: "1 <= string.length <= 10^5",
    },
    {
        id: 3,
        title: "Matrix Multiplication",
        description: "Multiply two matrices and return the result.",
        constraints: "Matrices should be valid for multiplication.",
    },
];

function EditorPage() {
    const [currentQ, setCurrentQ] = useState(questions[0]);
    const [codes, setCodes] = useState({});
    const [contestTime, setContestTime] = useState(60 * 60); // 1 hour
    const [problemTime, setProblemTime] = useState({});
    const [activeTime, setActiveTime] = useState(0);


    const { id: contestId } = useParams(); // get contest ID from URL
    const navigate = useNavigate();

    const handleSubmit = () => {
        navigate(`/contest/${contestId}/leaderboard`);}
        // Contest Timer
        useEffect(() => {
            const timer = setInterval(() => {
                setContestTime((prev) => (prev > 0 ? prev - 1 : 0));
                setActiveTime((prev) => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }, []);

        // When switching question, save time spent
        useEffect(() => {
            return () => {
                setProblemTime((prev) => ({
                    ...prev,
                    [currentQ.id]: (prev[currentQ.id] || 0) + activeTime,
                }));
            };
        }, [currentQ]);

        const handleCodeChange = (value) => {
            setCodes({ ...codes, [currentQ.id]: value });
        };

        const formatTime = (sec) => {
            const m = Math.floor(sec / 60);
            const s = sec % 60;
            return `${m}:${s < 10 ? "0" : ""}${s}`;
        };

        return (
            <Container fluid className="py-3">
                <Row>
                    {/* Question Panel */}
                    <Col md={4} className="mb-3">
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5>{currentQ.title}</h5>
                                    <DropdownButton
                                        title="Switch Question"
                                        variant="secondary"
                                        size="sm"
                                        onSelect={(id) => {
                                            setProblemTime((prev) => ({
                                                ...prev,
                                                [currentQ.id]: (prev[currentQ.id] || 0) + activeTime,
                                            }));
                                            setActiveTime(0);
                                            setCurrentQ(questions.find((q) => q.id === parseInt(id)));
                                        }}
                                    >
                                        {questions.map((q) => (
                                            <Dropdown.Item key={q.id} eventKey={q.id}>
                                                {q.title}
                                            </Dropdown.Item>
                                        ))}
                                    </DropdownButton>
                                </div>
                                <p>{currentQ.description}</p>
                                <small className="text-muted">Constraints: {currentQ.constraints}</small>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Editor Panel */}
                    <Col md={8}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                {/* Timers */}
                                <div className="d-flex justify-content-between mb-2">
                                    <span>⏳ Contest Time Left: {formatTime(contestTime)}</span>
                                    <span>🕒 Time on this problem: {formatTime(activeTime)}</span>
                                </div>

                                {/* Monaco Editor */}
                                <Editor
                                    height="400px"
                                    language="javascript"
                                    theme="vs-dark"
                                    value={codes[currentQ.id] || ""}
                                    onChange={handleCodeChange}
                                />

                                {/* Buttons */}
                                <div className="mt-3 d-flex gap-2">
                                    <Button variant="secondary">Run Code</Button>
                                    <Button variant="success">Submit</Button>
                                </div>
                                <Button
                                    variant="danger"
                                    className="mt-3"
                                    onClick={handleSubmit}
                                >
                                    Submit Contest
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    export default EditorPage;
