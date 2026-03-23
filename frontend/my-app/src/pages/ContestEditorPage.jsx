import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Form, Spinner } from "react-bootstrap";
import Editor from "@monaco-editor/react";
import axios from "axios";
import "../styles/ContestEditorPage.css";
import "../styles/global.css";
import "../styles/variables.css";

const API = import.meta.env.VITE_API_BASE_URL;

const editorLanguageMap = {
  javascript: "javascript",
  python: "python",
  cpp: "cpp",
  java: "java",
};

const judge0LanguageMap = {
  cpp: 54,
  python: 71,
  javascript: 63,
  java: 62,
};

const starterTemplates = {
  javascript: `function solve() {
  // Write your code here
  
}

solve();`,
  python: `def solve():
    # Write your code here
    pass

solve()`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Write your code here
    
    return 0;
}`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
};

function ContestEditorPage() {
  const { id, problemId } = useParams();
  const navigate = useNavigate();

  const [contestInfo, setContestInfo] = useState(null);
  const [problemList, setProblemList] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState(
    problemId ? Number(problemId) : null
  );

  const [language, setLanguage] = useState("cpp");
  const [leftTab, setLeftTab] = useState("description");
  const [bottomTab, setBottomTab] = useState("testcase");

  const [customInputMap, setCustomInputMap] = useState({});
  const [runSummary, setRunSummary] = useState({});
  const [runResults, setRunResults] = useState({});
  const [submitResults, setSubmitResults] = useState({});

  const [codeStore, setCodeStore] = useState({});
  const [loading, setLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  const [contestTime, setContestTime] = useState(0);
  const [activeTime, setActiveTime] = useState(0);
  const problemStartRef = useRef(Date.now());
  const [problemTimeMap, setProblemTimeMap] = useState({});

  const selectedProblem = useMemo(() => {
    if (!problemList.length) return null;
    return (
      problemList.find((problem) => problem.id === Number(selectedProblemId)) ||
      problemList[0]
    );
  }, [problemList, selectedProblemId]);

  const currentCode = selectedProblem
    ? codeStore?.[selectedProblem.id]?.[language] || starterTemplates[language]
    : starterTemplates[language];

  const formatTime = (sec) => {
    const safe = Math.max(0, Number(sec) || 0);
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60);
    const s = safe % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
      s
    ).padStart(2, "0")}`;
  };

  const buildCodeStore = (problems) => {
    const store = {};
    problems.forEach((problem) => {
      store[problem.id] = {
        javascript: starterTemplates.javascript,
        python: starterTemplates.python,
        cpp: starterTemplates.cpp,
        java: starterTemplates.java,
      };
    });
    return store;
  };

  const parseTags = (tagsValue) => {
    if (!tagsValue) return [];
    if (Array.isArray(tagsValue)) return tagsValue;
    return String(tagsValue)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  };

  const parseConstraints = (constraintsValue) => {
    if (!constraintsValue) return [];
    return String(constraintsValue)
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const getDifficultyClass = (difficulty) => {
    const value = String(difficulty || "").toLowerCase();
    if (value === "easy") return "editor-badge-easy";
    if (value === "medium") return "editor-badge-medium";
    if (value === "hard") return "editor-badge-hard";
    return "editor-badge-default";
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();
    if (value === "solved") return "editor-status-solved";
    if (value === "attempted") return "editor-status-attempted";
    return "editor-status-unsolved";
  };

  const normalizeProblemData = (problem, contestProblem, allTestcases, solvedMap) => {
    const problemTestcases = allTestcases.filter(
      (tc) => Number(tc.problem) === Number(problem.id)
    );

    const sampleTestcases = problemTestcases.filter((tc) => tc.is_sample);
    const firstSample = sampleTestcases[0] || problemTestcases[0] || null;

    const examples = sampleTestcases.map((tc, index) => ({
      input: tc.input,
      output: tc.expected_output,
      explanation: `Sample testcase ${index + 1}`,
    }));

    return {
      id: problem.id,
      contest_problem_id: contestProblem.id,
      order: contestProblem.order,
      title: problem.title,
      description: problem.description || "No description available.",
      difficulty: problem.difficulty || "easy",
      constraints: parseConstraints(problem.constraints),
      tags: parseTags(problem.tags),
      points: problem.points || 100,
      status: solvedMap[problem.id] ? "Solved" : "Unsolved",
      examples,
      testcases: firstSample?.input || "",
      testcaseObjects: problemTestcases,
    };
  };

  const initializeContest = async () => {
    try {
      setLoading(true);
      setError("");

      const contestRes = await axios.get(`${API}/api/contests/${id}/`);
      const contest = contestRes.data;

      const contestProblems = contest.problems || [];
      const problemIds = contestProblems.map((item) => item.problem_id);

      const [problemResponses, testcaseResponse] = await Promise.all([
        Promise.all(
          problemIds.map((pid) => axios.get(`${API}/api/problems/${pid}/`))
        ),
        axios.get(`${API}/api/testcases/`),
      ]);

      const problemDetails = problemResponses.map((res) => res.data);
      const allTestcases = Array.isArray(testcaseResponse.data)
        ? testcaseResponse.data
        : testcaseResponse.data.results || [];

      const solvedMap = {};

      const enrichedProblems = contestProblems
        .map((contestProblem) => {
          const matchingProblem = problemDetails.find(
            (problem) => Number(problem.id) === Number(contestProblem.problem_id)
          );
          if (!matchingProblem) return null;
          return normalizeProblemData(
            matchingProblem,
            contestProblem,
            allTestcases,
            solvedMap
          );
        })
        .filter(Boolean)
        .sort((a, b) => a.order - b.order);

      setContestInfo(contest);
      setProblemList(enrichedProblems);
      setCodeStore(buildCodeStore(enrichedProblems));

      const initialSelectedId =
        problemId && enrichedProblems.some((p) => p.id === Number(problemId))
          ? Number(problemId)
          : enrichedProblems[0]?.id || null;

      setSelectedProblemId(initialSelectedId);

      const customInputs = {};
      enrichedProblems.forEach((problem) => {
        customInputs[problem.id] = problem.testcases || "";
      });
      setCustomInputMap(customInputs);

      if (contest.end_time) {
        const remainingSeconds = Math.max(
          0,
          Math.floor((new Date(contest.end_time).getTime() - Date.now()) / 1000)
        );
        setContestTime(remainingSeconds);
      }
    } catch (err) {
      console.error("Contest editor load error:", err.response?.data || err.message);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Failed to load contest editor."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeContest();
  }, [id]);

  useEffect(() => {
    if (!contestInfo?.end_time) return;

    const timer = setInterval(() => {
      setContestTime((prev) => (prev > 0 ? prev - 1 : 0));
      setActiveTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [contestInfo?.end_time]);

  useEffect(() => {
    if (!selectedProblem?.id) return;
    problemStartRef.current = Date.now();
    setActiveTime(0);
  }, [selectedProblem?.id]);

  const handleProblemChange = (problem) => {
    if (!problem) return;

    if (selectedProblem?.id) {
      setProblemTimeMap((prev) => ({
        ...prev,
        [selectedProblem.id]: (prev[selectedProblem.id] || 0) + activeTime,
      }));
    }

    setSelectedProblemId(problem.id);
    setLeftTab("description");
    setBottomTab("testcase");
    setActiveTime(0);
  };

  const handleEditorChange = (value) => {
    if (!selectedProblem) return;

    setCodeStore((prev) => ({
      ...prev,
      [selectedProblem.id]: {
        ...(prev[selectedProblem.id] || {}),
        [language]: value || "",
      },
    }));
  };

  const handleRun = async () => {
    if (!selectedProblem) return;

    try {
      setRunLoading(true);
      setBottomTab("testcase");

      const res = await axios.post(`${API}/api/run-code/`, {
        problem_id: selectedProblem.id,
        source_code: currentCode,
        language_id: judge0LanguageMap[language],
      });

      setRunSummary((prev) => ({
        ...prev,
        [selectedProblem.id]: {
          passed: res.data.passed,
          total: res.data.total,
        },
      }));

      setRunResults((prev) => ({
        ...prev,
        [selectedProblem.id]: res.data.results || [],
      }));
    } catch (err) {
      console.error("Run error:", err.response?.data || err.message);
      setRunSummary((prev) => ({
        ...prev,
        [selectedProblem.id]: null,
      }));
      setRunResults((prev) => ({
        ...prev,
        [selectedProblem.id]: [
          {
            testcase: "Error",
            expected_output: "",
            actual_output:
              err.response?.data?.error || err.response?.data?.detail || "Run failed",
            passed: false,
          },
        ],
      }));
    } finally {
      setRunLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("access");

      if (!token) {
        alert("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const answers = problemList.map((problem) => ({
        problem_id: problem.id,
        source_code: codeStore?.[problem.id]?.[language] || starterTemplates[language],
        language_id: judge0LanguageMap[language],
        language,
      }));

      const hasEmptyCode = answers.some((item) => !item.source_code.trim());
      if (hasEmptyCode) {
        alert("Please write code for all questions before submitting.");
        return;
      }

      setSubmitLoading(true);

      const res = await axios.post(
        `${API}/api/submit-contest/`,
        {
          contest_id: id,
          answers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const resultMap = {};
      (res.data.results || []).forEach((item) => {
        resultMap[item.problem_id] = item;
      });

      setSubmitResults(resultMap);
      setBottomTab("result");

      alert("Contest submitted successfully.");
      navigate(`/contest/${id}/leaderboard`);
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
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="contest-editor-layout d-flex align-items-center justify-content-center">
        <div className="text-center text-light">
          <Spinner animation="border" className="mb-3" />
          <div>Loading contest editor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contest-editor-layout d-flex align-items-center justify-content-center">
        <div className="text-center text-light">
          <h5 className="mb-2">Failed to load editor</h5>
          <p className="mb-3">{error}</p>
          <Button onClick={initializeContest}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!selectedProblem) {
    return (
      <div className="contest-editor-layout d-flex align-items-center justify-content-center">
        <div className="text-center text-light">No problem found for this contest.</div>
      </div>
    );
  }

  const selectedRunSummary = runSummary[selectedProblem.id];
  const selectedRunResults = runResults[selectedProblem.id] || [];
  const selectedSubmitResult = submitResults[selectedProblem.id];
  const contestTitle = contestInfo?.name || "Contest";
  const contestStatus = contestInfo?.status || "Live";

  return (
    <div className="contest-editor-layout">
      <div className="editor-topbar d-flex align-items-center justify-content-between px-3 border-bottom bg-dark text-light">
        <div className="d-flex align-items-center gap-3">
          <Link
            to={`/contest/${id}`}
            className="text-decoration-none text-light small"
          >
            ← Problem List
          </Link>

          <div className="vr"></div>

          <span className="fw-semibold small">{contestTitle}</span>

          <span className="badge bg-success">{contestStatus}</span>

          <span className="badge bg-warning text-dark">
            {formatTime(contestTime)}
          </span>

          <span className="badge bg-secondary">
            This Problem: {formatTime(activeTime)}
          </span>
        </div>

        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant="outline-light"
            onClick={handleRun}
            disabled={runLoading}
          >
            {runLoading ? "Running..." : "Run"}
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleSubmit}
            disabled={submitLoading || !problemList.length}
          >
            {submitLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>

      <div className="editor-main-grid">
        <aside className="editor-left-panel">
          <div className="editor-left-header">
            <div className="editor-problem-tabs-scroll">
              {problemList.map((problem, index) => (
                <button
                  key={problem.id}
                  className={`editor-problem-tab ${selectedProblem.id === problem.id ? "active" : ""
                    }`}
                  onClick={() => handleProblemChange(problem)}
                >
                  {index + 1}. {problem.title}
                </button>
              ))}
            </div>
          </div>

          <div className="editor-problem-details">
            <div className="editor-problem-title-row">
              <h2 className="editor-problem-title">
                {selectedProblem.order}. {selectedProblem.title}
              </h2>
            </div>

            <div className="editor-problem-badges">
              <span
                className={`editor-pill ${getDifficultyClass(
                  selectedProblem.difficulty
                )}`}
              >
                {selectedProblem.difficulty}
              </span>

              <span
                className={`editor-pill ${getStatusClass(selectedProblem.status)}`}
              >
                {selectedProblem.status}
              </span>

              <span className="editor-pill editor-points-pill">
                {selectedProblem.points} Points
              </span>

              {selectedProblem.tags.map((tag, index) => (
                <span key={index} className="editor-pill editor-tag-pill">
                  {tag}
                </span>
              ))}
            </div>

            <div className="editor-left-tabs">
              <button
                className={`editor-left-tab-btn ${leftTab === "description" ? "active" : ""
                  }`}
                onClick={() => setLeftTab("description")}
              >
                Description
              </button>

              <button
                className={`editor-left-tab-btn ${leftTab === "examples" ? "active" : ""
                  }`}
                onClick={() => setLeftTab("examples")}
              >
                Examples
              </button>

              <button
                className={`editor-left-tab-btn ${leftTab === "constraints" ? "active" : ""
                  }`}
                onClick={() => setLeftTab("constraints")}
              >
                Constraints
              </button>
            </div>

            <div className="editor-left-content">
              {leftTab === "description" && (
                <div className="editor-content-section">
                  {String(selectedProblem.description || "")
                    .split("\n\n")
                    .map((para, index) => (
                      <p key={index} className="editor-text">
                        {para}
                      </p>
                    ))}
                </div>
              )}

              {leftTab === "examples" && (
                <div className="editor-content-section">
                  {selectedProblem.examples.length ? (
                    selectedProblem.examples.map((example, index) => (
                      <div key={index} className="editor-example-card">
                        <h6 className="editor-section-heading">
                          Example {index + 1}
                        </h6>

                        <div className="editor-example-block">
                          <strong>Input:</strong>
                          <pre>{example.input}</pre>
                        </div>

                        <div className="editor-example-block">
                          <strong>Output:</strong>
                          <pre>{example.output}</pre>
                        </div>

                        <div className="editor-example-block">
                          <strong>Explanation:</strong>
                          <pre>{example.explanation}</pre>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="editor-text">No sample examples available.</p>
                  )}
                </div>
              )}

              {leftTab === "constraints" && (
                <div className="editor-content-section">
                  <h6 className="editor-section-heading">Constraints</h6>
                  {selectedProblem.constraints.length ? (
                    <ul className="editor-constraints-list">
                      {selectedProblem.constraints.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="editor-text">No constraints available.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="editor-right-panel">
          <div className="editor-code-header">
            <div className="editor-code-header-left">
              <span className="editor-code-title">Code</span>
            </div>

            <div className="editor-code-header-right">
              <Form.Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="editor-language-select"
              >
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
              </Form.Select>
            </div>
          </div>

          <div className="editor-monaco-wrap">
            <Editor
              height="100%"
              language={editorLanguageMap[language]}
              value={currentCode}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                lineNumbers: "on",
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on",
                padding: { top: 16 },
              }}
            />
          </div>

          <div className="editor-bottom-panel">
            <div className="editor-bottom-tabs">
              <button
                className={`editor-bottom-tab ${bottomTab === "testcase" ? "active" : ""
                  }`}
                onClick={() => setBottomTab("testcase")}
              >
                Testcase
              </button>

              <button
                className={`editor-bottom-tab ${bottomTab === "result" ? "active" : ""
                  }`}
                onClick={() => setBottomTab("result")}
              >
                Test Result
              </button>
            </div>

            <div className="editor-bottom-content">
              {bottomTab === "testcase" && (
                <div className="editor-testcase-section">
                  <label className="editor-input-label">Custom Input</label>

                  <textarea
                    className="editor-custom-input"
                    value={customInputMap[selectedProblem.id] || ""}
                    onChange={(e) =>
                      setCustomInputMap((prev) => ({
                        ...prev,
                        [selectedProblem.id]: e.target.value,
                      }))
                    }
                    placeholder={selectedProblem.testcases || "Enter custom input"}
                  />

                  <div className="editor-output-card">
                    <div className="editor-output-heading">Run Summary</div>

                    <pre className="editor-output-pre">
                      {selectedRunSummary
                        ? `Passed ${selectedRunSummary.passed}/${selectedRunSummary.total} testcases`
                        : "Run your code to see output here."}
                    </pre>
                  </div>

                  {!!selectedRunResults.length && (
                    <div className="editor-output-card mt-3">
                      <div className="editor-output-heading">Detailed Results</div>

                      {selectedRunResults.map((item, index) => (
                        <div key={index} className="mb-3">
                          <div className={item.passed ? "text-success" : "text-danger"}>
                            Test Case {item.testcase}: {item.passed ? "Passed" : "Failed"}
                          </div>
                          <pre className="editor-output-pre mb-2">
                            {`Expected:
${item.expected_output || "N/A"}

Actual:
${item.actual_output || "No output"}`}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {bottomTab === "result" && (
                <div className="editor-output-card editor-output-card-full">
                  <div className="editor-output-heading">Submission Result</div>

                  <pre className="editor-output-pre">
                    {selectedSubmitResult
                      ? `Problem: ${selectedSubmitResult.title}
Verdict: ${selectedSubmitResult.passed ? "Accepted" : "Wrong Answer"}
Passed Testcases: ${selectedSubmitResult.passed_testcases}/${selectedSubmitResult.total_testcases}
Score: ${selectedSubmitResult.score}`
                      : "Submission result will appear here."}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ContestEditorPage;