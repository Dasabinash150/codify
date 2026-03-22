import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Dropdown, DropdownButton, Card } from "react-bootstrap";
import Editor from "@monaco-editor/react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";



function EditorPage() {

    
    const API = import.meta.env.VITE_API_BASE_URL

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
    const [summary, setSummary] = useState({});
    const [testcaseResults, setTestcaseResults] = useState({});
    const [runSummary, setRunSummary] = useState({});

    const { id: contestId } = useParams();
    const navigate = useNavigate();

    // const handleSubmitContest = async () => {
    //     try {
    //         const submissions = questions.map((q) => ({
    //             problem_id: q.id,
    //             code: codes[q.id] || "",
    //             language_id: 71,
    //         }));

    //         await axios.post("http://127.0.0.1:8000/api/submit-contest/", {
    //             contest_id: contestId,
    //             submissions,
    //         });

    //         alert("Submitted!");
    //         navigate(`/contest/${contestId}/leaderboard`);

    //     } catch (err) {
    //         alert("Submit Failed");
    //     }
    // };
    // 
    const handleSubmitContest = async () => {
        try {
            const token = localStorage.getItem("access");

            if (!token) {
                alert("Session expired. Please login again.");
                navigate("/login");
                return;
            }

            const answers = questions.map((q) => ({
                problem_id: q.id,
                source_code: codes[q.id] || "",
                language_id: 71,
            }));
            // ===================check code written or not =================
            const hasEmptyCode = answers.some(a => !a.source_code.trim());

            if (hasEmptyCode) {
                alert("Please write code for all questions before submitting.");
                return;
            }
            // ===================check code written or not =================
            const res = await axios.post(
                `${API}/api/submit-contest/`,
                {
                    contest_id: contestId,
                    answers: answers,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("Submitted successfully");
            navigate(`/contest/${contestId}/leaderboard`);

        } catch (err) {
            console.error("Submit error:", err.response?.data || err.message);

            if (err.response?.status === 401) {
                alert("Session expired. Please login again.");
                localStorage.clear();
                navigate("/login");
                return;
            }

            alert(
                err.response?.data?.error ||
                err.response?.data?.detail ||
                "Contest submit failed"
            );
        }
    };

    useEffect(() => {
        return () => {
            if (!currentQ) return;

            setProblemTime((prev) => ({
                ...prev,
                [currentQ.id]: (prev[currentQ.id] || 0) + activeTime,
            }));
        };
    }, [currentQ, activeTime]);

    // const handleCodeChange = (value) => {
    //     if (!currentQ) return;

    //     setCodes((prev) => ({
    //         ...prev,
    //         [currentQ.id]: value || "",
    //     }));
    // };
    const handleCodeChange = (value) => {
        if (!currentQ) return;

        setCodes((prev) => ({
            ...prev,
            [currentQ.id]: value || "",
        }));
    };
    const handleQuestionChange = (question) => {
        setCurrentQ(question);
    };

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };
    const handleRunCode = async () => {
        if (!currentQ) return;

        try {
            setLoading(true);

            const res = await axios.post(`${API}/api/run-code/`, {
                problem_id: currentQ.id,
                source_code: codes[currentQ.id] || "",
                language_id: 71,
            });

            setRunSummary((prev) => ({
                ...prev,
                [currentQ.id]: {
                    passed: res.data.passed,
                    total: res.data.total,
                },
            }));

            setTestcaseResults((prev) => ({
                ...prev,
                [currentQ.id]: res.data.results || [],
            }));

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Run code failed");
        } finally {
            setLoading(false);
        }
    };
    // useEffect(() => {
    //     const savedCodes = JSON.parse(localStorage.getItem("codes")) || {};
    //     setCodes(savedCodes);
    // }, []);

    // useEffect(() => {
    //     localStorage.setItem("codes", JSON.stringify(codes));
    // }, [codes]);

    useEffect(() => {
        const timer = setInterval(() => {
            setContestTime((prev) => (prev > 0 ? prev - 1 : 0));
            setActiveTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        axios
            .get(`${API}/api/contests/${contestId}/`)
            .then((res) => {
                console.log("Contest details:", res.data);

                const contestProblems = res.data.contest_problems || [];

                const flatQuestions = contestProblems.map((item) => ({
                    contest_problem_id: item.id,
                    ...item.problem,
                }));

                setQuestions(flatQuestions);

                if (flatQuestions.length > 0) {
                    setCurrentQ(flatQuestions[0]);
                }
            })
            .catch((err) => {
                console.log("Error loading contest problems", err.response?.data || err.message);
            });
    }, [contestId]);
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

                            {/* <Editor
                                height="400px"
                                language="python"
                                theme="vs-dark"
                                value={currentQ ? (codes[currentQ.id] || "") : ""}
                                onChange={handleCodeChange}
                            /> */}
                            <Editor
                                height="500px"
                                language="python"
                                theme="vs-dark"
                                value={codes[currentQ?.id] || ""}
                                onChange={(value) =>
                                    setCodes((prev) => ({
                                        ...prev,
                                        [currentQ.id]: value || "",
                                    }))
                                }
                            />
                            {/* <Editor
                                height="400px"
                                language="python"
                                theme="vs-dark"
                                value={codes[currentQ?.id] || ""}
                                onChange={(value) =>
                                    setCodes((prev) => ({
                                        ...prev,
                                        [currentQ.id]: value || "",
                                    }))
                                }
                            /> */}

                            <div className="mt-3 d-flex gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={handleRunCode}
                                    disabled={loading || !currentQ}
                                >
                                    {loading ? "Running..." : "Run Code"}
                                </Button>

                                {/* <Button
                                    variant="danger"
                                    onClick={handleSubmitContest}
                                    disabled={!questions.length}
                                >
                                    Submit Contest
                                </Button> */}
                                <Button
                                    variant="danger"
                                    onClick={handleSubmitContest}
                                    disabled={!questions.length || !Object.keys(codes).length}
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
                            {summary[currentQ?.id] && (
                                <p>Passed {summary[currentQ.id].passed}/{summary[currentQ.id].total}</p>
                            )}

                            {(testResults[currentQ?.id] || []).map((tc, i) => (
                                <div key={i}>
                                    <p>Test {tc.testcase} → {tc.passed ? "✅" : "❌"}</p>
                                    <p>Expected: {tc.expected_output}</p>
                                    <p>Your: {tc.actual_output}</p>
                                </div>
                            ))}
                            <Card className="mt-3">
                                <Card.Body>
                                    <h5>Test Case Results</h5>

                                    {runSummary[currentQ?.id] && (
                                        <p>
                                            Passed <strong>{runSummary[currentQ.id].passed}/{runSummary[currentQ.id].total}</strong>
                                        </p>
                                    )}

                                    {(testcaseResults[currentQ?.id] || []).map((tc, index) => (
                                        <Card key={index} className="mb-2">
                                            <Card.Body>
                                                <h6>
                                                    Test Case {tc.testcase} -{" "}
                                                    <span className={tc.passed ? "text-success" : "text-danger"}>
                                                        {tc.passed ? "Passed" : "Failed"}
                                                    </span>
                                                </h6>

                                                <p><strong>Input:</strong></p>
                                                <pre>{tc.input}</pre>

                                                <p><strong>Expected Output:</strong></p>
                                                <pre>{tc.expected_output}</pre>

                                                <p><strong>Your Output:</strong></p>
                                                <pre>{tc.actual_output || "No output"}</pre>

                                                {tc.stderr && <pre className="text-danger">{tc.stderr}</pre>}
                                                {tc.compile_output && <pre className="text-danger">{tc.compile_output}</pre>}
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </Card.Body>
                            </Card>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default EditorPage;