import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Dropdown, DropdownButton, Card } from "react-bootstrap";
import Editor from "@monaco-editor/react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function EditorPage() {
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(null);
    const [codes, setCodes] = useState({});
    const [contestTime, setContestTime] = useState(60 * 60);
    const [problemTime, setProblemTime] = useState({});
    const [activeTime, setActiveTime] = useState(0);
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);
    const [testResults, setTestResults] = useState([]);

    const { id: contestId } = useParams();
    const navigate = useNavigate();

    const handleSubmitContest = async () => {
        try {
            await axios.post("http://127.0.0.1:8000/api/submit-contest/", {
                contest_id: contestId,
                submissions: Object.keys(codes).map((pid) => ({
                    problem_id: parseInt(pid),
                    code: codes[pid],
                    language_id: 71
                }))
            });

            alert("Contest submitted successfully");
            navigate(`/contest/${contestId}/leaderboard`);
        } catch (error) {
            console.error(error);
            alert("Contest submission failed");
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setContestTime((prev) => (prev > 0 ? prev - 1 : 0));
            setActiveTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/api/contests/${contestId}/`)
            .then((res) => {
                const contestProblems = res.data.contest_problems || [];

                const flatQuestions = contestProblems.map((item) => ({
                    contest_problem_id: item.id,
                    ...item.problem
                }));

                setQuestions(flatQuestions);

                if (flatQuestions.length > 0) {
                    setCurrentQ(flatQuestions[0]);
                }
            })
            .catch((err) => {
                console.log("Error loading contest problems", err);
            });

    }, [contestId]);

    useEffect(() => {
        return () => {
            if (!currentQ) return;

            setProblemTime((prev) => ({
                ...prev,
                [currentQ.id]: (prev[currentQ.id] || 0) + activeTime,
            }));
        };
    }, [currentQ, activeTime]);

    const handleCodeChange = (value) => {
        if (!currentQ) return;

        setCodes((prev) => ({
            ...prev,
            [currentQ.id]: value || "",
        }));
    };

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const handleRunCode = async () => {
        if (!currentQ) return;

        setLoading(true);
        setOutput("Running...");
        setTestResults([]);

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/run-code/",
                {
                    problem_id: currentQ.id,
                    source_code: codes[currentQ.id] || "",
                    language_id: 71,
                    custom_input: input
                }
            );

            const data = response.data;

            if (data.mode === "custom") {
                setOutput(data.output || "No output");
                setTestResults([]);
            } else {
                setOutput(`Passed ${data.passed_count}/${data.total_testcases} test cases`);
                setTestResults(data.results || []);
            }
        } catch (error) {
            console.error(error);
            setOutput("Server Error");
        }

        setLoading(false);
    };

    useEffect(() => {
        const savedCodes = JSON.parse(localStorage.getItem("codes")) || {};
        setCodes(savedCodes);
    }, []);

    useEffect(() => {
        localStorage.setItem("codes", JSON.stringify(codes));
    }, [codes]);

    return (
        <Container fluid className="py-3">
            <Row>
                <Col md={4} className="mb-3">
                    <Card className="h-100 shadow-sm">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5>{currentQ?.title || "Loading..."}</h5>

                                <DropdownButton
                                    title="Switch Question"
                                    variant="secondary"
                                    size="sm"
                                    onSelect={(id) => {
                                        const selected = questions.find(q => q.id === parseInt(id));

                                        setProblemTime((prev) => ({
                                            ...prev,
                                            [currentQ?.id]: (prev[currentQ?.id] || 0) + activeTime,
                                        }));

                                        setActiveTime(0);
                                        setCurrentQ(selected);
                                    }}
                                >
                                    {questions.map((q) => (
                                        <Dropdown.Item key={q.id} eventKey={q.id}>
                                            {q.title}
                                        </Dropdown.Item>
                                    ))}
                                </DropdownButton>
                            </div>

                            <div style={{ whiteSpace: "pre-line" }} className="mb-3">
                                {currentQ?.description || "No description available."}
                            </div>

                            <div className="bg-light p-2 rounded">
                                <strong>Constraints:</strong>
                                <div>{currentQ?.constraints || "No constraints available."}</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body>
                            <div className="d-flex justify-content-between mb-2">
                                <span>⏳ Contest Time Left: {formatTime(contestTime)}</span>
                                <span>🕒 Time on this problem: {formatTime(activeTime)}</span>
                            </div>

                            <Editor
                                height="400px"
                                language="python"
                                theme="vs-dark"
                                value={currentQ ? (codes[currentQ.id] || "") : ""}
                                onChange={handleCodeChange}
                            />

                            <div className="mt-3 d-flex gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={handleRunCode}
                                    disabled={loading || !currentQ}
                                >
                                    {loading ? "Running..." : "Run Code"}
                                </Button>

                                <Button
                                    variant="danger"
                                    onClick={handleSubmitContest}
                                    disabled={!questions.length}
                                >
                                    Submit Contest
                                </Button>
                            </div>

                            <div className="mt-3">
                                <h6>Input</h6>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Enter runtime input here..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />
                            </div>

                            <div className="mt-3">
                                <h6>Output</h6>
                                <pre
                                    className="bg-dark text-white p-2 rounded"
                                    style={{ minHeight: "100px" }}
                                >
                                    {output}
                                </pre>
                            </div>
                            <div className="mt-3">
                                <h6>Test Case Results</h6>

                                {testResults.length > 0 ? (
                                    <table className="table table-bordered table-sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Test Case</th>
                                                <th>Input</th>
                                                <th>Expected</th>
                                                <th>Actual</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {testResults.map((tc) => (
                                                <tr
                                                    key={tc.testcase_number}
                                                    className={tc.passed ? "table-success" : "table-danger"}
                                                >
                                                    <td>{tc.testcase_number}</td>
                                                    <td><pre className="mb-0">{tc.input}</pre></td>
                                                    <td><pre className="mb-0">{tc.expected_output}</pre></td>
                                                    <td><pre className="mb-0">{tc.actual_output}</pre></td>
                                                    <td>
                                                        {tc.passed ? (
                                                            <span className="text-success">✅ Passed</span>
                                                        ) : (
                                                            <span className="text-danger">❌ Failed</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-muted">No test case results yet.</p>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default EditorPage;