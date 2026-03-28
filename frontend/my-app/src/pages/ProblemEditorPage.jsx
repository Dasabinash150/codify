import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Form, Spinner } from "react-bootstrap";
import Editor from "@monaco-editor/react";
import {
  getProblemById,
  getProblemTestCases,
  runProblemCode,
  submitProblemCode,
} from "../services/problemApi";
import "../styles/ContestEditorPage.css";
import "../styles/global.css";
import "../styles/variables.css";

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

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function ProblemEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const draftKey = useMemo(() => `problem_editor_draft_${id}`, [id]);

  const mainGridRef = useRef(null);
  const rightPanelRef = useRef(null);
  const dragStateRef = useRef(null);
  const hydratedRef = useRef(false);

  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [language, setLanguage] = useState("python");
  const [leftTab, setLeftTab] = useState("description");
  const [bottomTab, setBottomTab] = useState("testcase");

  const [codeStore, setCodeStore] = useState({
    javascript: starterTemplates.javascript,
    python: starterTemplates.python,
    cpp: starterTemplates.cpp,
    java: starterTemplates.java,
  });

  const [customInput, setCustomInput] = useState("");
  const [runSummary, setRunSummary] = useState(null);
  const [runResults, setRunResults] = useState([]);
  const [submitResult, setSubmitResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  const [leftPanelWidth, setLeftPanelWidth] = useState(45);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(240);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentCode = codeStore[language] || starterTemplates[language];

  const hasUnsavedWork = useMemo(() => {
    const hasCodeChange = Object.entries(starterTemplates).some(
      ([lang, template]) => (codeStore[lang] ?? template) !== template
    );
    const hasCustomInput = customInput.trim() !== "";
    return !isSubmitted && (hasCodeChange || hasCustomInput);
  }, [codeStore, customInput, isSubmitted]);

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

  const getVerdictLabel = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "AC") return "Accepted";
    if (value === "WA") return "Wrong Answer";
    if (value === "TLE") return "Time Limit Exceeded";
    if (value === "RE") return "Runtime Error";
    if (value === "CE") return "Compilation Error";
    if (value === "PENDING") return "Pending";

    return value || "Unknown";
  };

  const getErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (!data) return fallback;

    if (typeof data === "string") return data;
    if (typeof data?.detail === "string") return data.detail;
    if (typeof data?.error === "string") return data.error;
    if (typeof data?.message === "string") return data.message;

    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];

    if (Array.isArray(firstValue)) return firstValue[0];
    if (typeof firstValue === "string") return firstValue;

    return fallback;
  };

  const examples = useMemo(() => {
    return testCases
      .filter((tc) => tc.is_sample || tc.sample || tc.isSample)
      .map((tc, index) => ({
        input: tc.input,
        output: tc.expected_output,
        explanation: `Sample testcase ${index + 1}`,
      }));
  }, [testCases]);

  const fallbackExamples = useMemo(() => {
    if (examples.length) return examples;

    return testCases.slice(0, 2).map((tc, index) => ({
      input: tc.input,
      output: tc.expected_output,
      explanation: `Sample testcase ${index + 1}`,
    }));
  }, [examples, testCases]);

  const defaultInput = useMemo(() => {
    return testCases[0]?.input || "";
  }, [testCases]);

  const clearDraft = () => {
    localStorage.removeItem(draftKey);
  };

  useEffect(() => {
    const loadProblem = async () => {
      try {
        setLoading(true);
        setError("");

        const [problemRes, testCaseRes] = await Promise.all([
          getProblemById(id),
          getProblemTestCases(id),
        ]);

        const loadedProblem = problemRes?.data || null;
        const loadedTestCases = Array.isArray(testCaseRes?.data)
          ? testCaseRes.data
          : testCaseRes?.data?.results || [];

        setProblem(loadedProblem);
        setTestCases(loadedTestCases);

        let savedDraft = null;
        try {
          const raw = localStorage.getItem(draftKey);
          savedDraft = raw ? JSON.parse(raw) : null;
        } catch (e) {
          console.error("Draft parse error:", e);
        }

        if (savedDraft?.codeStore && typeof savedDraft.codeStore === "object") {
          setCodeStore((prev) => ({
            ...prev,
            ...savedDraft.codeStore,
          }));
        }

        if (typeof savedDraft?.customInput === "string") {
          setCustomInput(savedDraft.customInput);
        } else {
          setCustomInput(loadedTestCases[0]?.input || "");
        }

        if (
          savedDraft?.language &&
          Object.prototype.hasOwnProperty.call(starterTemplates, savedDraft.language)
        ) {
          setLanguage(savedDraft.language);
        }

        setLeftPanelWidth(clamp(Number(savedDraft?.leftPanelWidth) || 45, 28, 72));
        setBottomPanelHeight(
          clamp(Number(savedDraft?.bottomPanelHeight) || 240, 160, 500)
        );
        setIsSubmitted(Boolean(savedDraft?.isSubmitted));

        hydratedRef.current = true;
      } catch (err) {
        console.error("Problem editor load error:", err);
        setError(getErrorMessage(err, "Failed to load problem."));
      } finally {
        setLoading(false);
      }
    };

    loadProblem();
  }, [id, draftKey]);

  useEffect(() => {
    if (!hydratedRef.current || loading) return;

    const payload = {
      codeStore,
      customInput,
      language,
      leftPanelWidth,
      bottomPanelHeight,
      isSubmitted,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(draftKey, JSON.stringify(payload));
  }, [
    bottomPanelHeight,
    codeStore,
    customInput,
    draftKey,
    isSubmitted,
    language,
    leftPanelWidth,
    loading,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasUnsavedWork) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedWork]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!dragStateRef.current) return;

      if (dragStateRef.current.type === "horizontal" && mainGridRef.current) {
        const rect = mainGridRef.current.getBoundingClientRect();
        const nextWidth = clamp(
          ((event.clientX - rect.left) / rect.width) * 100,
          28,
          72
        );
        setLeftPanelWidth(nextWidth);
      }

      if (dragStateRef.current.type === "vertical" && rightPanelRef.current) {
        const rect = rightPanelRef.current.getBoundingClientRect();
        const maxHeight = Math.max(220, rect.height - 140);
        const nextHeight = clamp(rect.bottom - event.clientY, 160, maxHeight);
        setBottomPanelHeight(nextHeight);
      }
    };

    const handleMouseUp = () => {
      dragStateRef.current = null;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startHorizontalResize = () => {
    dragStateRef.current = { type: "horizontal" };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  const startVerticalResize = () => {
    dragStateRef.current = { type: "vertical" };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "row-resize";
  };

  const handleBackToProblems = () => {
    if (!hasUnsavedWork) {
      navigate("/problems");
      return;
    }

    const shouldLeave = window.confirm(
      "You have unsaved code. Do you want to leave without submitting?"
    );

    if (shouldLeave) {
      navigate("/problems");
    }
  };

  const handleEditorChange = (value) => {
    setIsSubmitted(false);
    setCodeStore((prev) => ({
      ...prev,
      [language]: value || "",
    }));
  };

  const handleCustomInputChange = (value) => {
    setIsSubmitted(false);
    setCustomInput(value);
  };

  const handleRun = async () => {
    try {
      setRunLoading(true);
      setBottomTab("testcase");

      const res = await runProblemCode({
        source_code: currentCode,
        language_id: judge0LanguageMap[language],
        stdin: customInput || defaultInput || "",
        problem_id: Number(id),
      });

      const data = res?.data || {};

      if (Array.isArray(data.results)) {
        setRunSummary({
          passed: data.passed ?? 0,
          total: data.total ?? data.results.length,
        });
        setRunResults(data.results);
      } else {
        const stdout = data.stdout || "";
        const stderr = data.stderr || "";
        const compileOutput = data.compile_output || "";
        const message = data.message || "";

        setRunSummary(null);
        setRunResults([
          {
            testcase: 1,
            passed: !stderr && !compileOutput,
            expected_output: "N/A",
            actual_output:
              stdout || stderr || compileOutput || message || "No output",
          },
        ]);
      }
    } catch (err) {
      console.error("RUN ERROR:", err);
      alert(getErrorMessage(err, "Run failed"));
    } finally {
      setRunLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setBottomTab("result");

      const res = await submitProblemCode({
        problem_id: Number(id),
        source_code: currentCode,
        language_id: judge0LanguageMap[language],
      });

      const data = res?.data || {};

      setSubmitResult({
        title: problem?.title || "Problem",
        status:
          data.status ||
          (data.passed === data.total && data.total > 0 ? "AC" : "WA"),
        score: data.score ?? 0,
        runtime: data.runtime ?? 0,
        passed_testcases: data.passed ?? 0,
        total_testcases: data.total ?? testCases.length,
        raw: data,
      });

      setIsSubmitted(true);
      clearDraft();
    } catch (err) {
      console.error("Submit error:", err);

      if (err?.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/login");
        return;
      }

      alert(getErrorMessage(err, "Submit failed"));
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="contest-editor-layout d-flex align-items-center justify-content-center">
        <div className="text-center text-light">
          <Spinner animation="border" className="mb-3" />
          <div>Loading problem editor...</div>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="contest-editor-layout d-flex align-items-center justify-content-center">
        <div className="text-center text-light">
          <h5 className="mb-2">Failed to load editor</h5>
          <p className="mb-3">{error || "Problem not found."}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="contest-editor-layout">
      <div className="editor-topbar d-flex align-items-center justify-content-between px-3 border-bottom bg-dark text-light">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            onClick={handleBackToProblems}
            className="btn btn-link text-decoration-none text-light small p-0"
          >
            ← Problem List
          </button>

          <div className="vr"></div>

          <span className="fw-semibold small">{problem.title}</span>

          <span className={`editor-pill ${getDifficultyClass(problem.difficulty)}`}>
            {problem.difficulty || "Unknown"}
          </span>

          <span className="editor-pill editor-points-pill">
            {problem.points ?? 100} Points
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
            disabled={submitLoading}
          >
            {submitLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>

      <div
        className="editor-main-grid"
        ref={mainGridRef}
        style={{
          gridTemplateColumns: `${leftPanelWidth}% 8px calc(${100 - leftPanelWidth}% - 8px)`,
        }}
      >
        <aside className="editor-left-panel">
          <div className="editor-problem-details">
            <div className="editor-problem-title-row">
              <h2 className="editor-problem-title">{problem.title}</h2>
            </div>

            <div className="editor-problem-badges">
              <span className={`editor-pill ${getDifficultyClass(problem.difficulty)}`}>
                {problem.difficulty || "Unknown"}
              </span>

              <span className="editor-pill editor-points-pill">
                {problem.points ?? 100} Points
              </span>

              {parseTags(problem.tags).map((tag, index) => (
                <span key={index} className="editor-pill editor-tag-pill">
                  {tag}
                </span>
              ))}
            </div>

            <div className="editor-left-tabs">
              <button
                className={`editor-left-tab-btn ${leftTab === "description" ? "active" : ""}`}
                onClick={() => setLeftTab("description")}
              >
                Description
              </button>

              <button
                className={`editor-left-tab-btn ${leftTab === "examples" ? "active" : ""}`}
                onClick={() => setLeftTab("examples")}
              >
                Examples
              </button>

              <button
                className={`editor-left-tab-btn ${leftTab === "constraints" ? "active" : ""}`}
                onClick={() => setLeftTab("constraints")}
              >
                Constraints
              </button>
            </div>

            <div className="editor-left-content">
              {leftTab === "description" && (
                <div className="editor-content-section">
                  {String(problem.description || "No description available.")
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
                  {fallbackExamples.length ? (
                    fallbackExamples.map((example, index) => (
                      <div key={index} className="editor-example-card">
                        <h6 className="editor-section-heading">Example {index + 1}</h6>

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
                  {parseConstraints(problem.constraints).length ? (
                    <ul className="editor-constraints-list">
                      {parseConstraints(problem.constraints).map((item, index) => (
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

        <div
          role="separator"
          aria-orientation="vertical"
          className="editor-resizer editor-resizer-vertical"
          onMouseDown={startHorizontalResize}
        />

        <section
          className="editor-right-panel"
          ref={rightPanelRef}
          style={{
            display: "grid",
            gridTemplateRows: `48px minmax(0, 1fr) 8px ${bottomPanelHeight}px`,
          }}
        >
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
                <option value="python">Python</option>
                <option value="cpp">C++</option>
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

          <div
            role="separator"
            aria-orientation="horizontal"
            className="editor-resizer editor-resizer-horizontal"
            onMouseDown={startVerticalResize}
          />

          <div className="editor-bottom-panel">
            <div className="editor-bottom-tabs">
              <button
                className={`editor-bottom-tab ${bottomTab === "testcase" ? "active" : ""}`}
                onClick={() => setBottomTab("testcase")}
              >
                Testcase
              </button>

              <button
                className={`editor-bottom-tab ${bottomTab === "result" ? "active" : ""}`}
                onClick={() => setBottomTab("result")}
              >
                Result
              </button>
            </div>

            <div className="editor-bottom-content">
              {bottomTab === "testcase" && (
                <div className="editor-testcase-section">
                  <label className="editor-input-label">Custom Input</label>

                  <textarea
                    className="editor-custom-input"
                    value={customInput}
                    onChange={(e) => handleCustomInputChange(e.target.value)}
                    placeholder={defaultInput || "Enter custom input"}
                  />

                  <div className="editor-output-card">
                    <div className="editor-output-heading">Run Summary</div>
                    <pre className="editor-output-pre">
                      {runSummary
                        ? `Passed ${runSummary.passed}/${runSummary.total} testcases`
                        : "Run your code to see output here."}
                    </pre>
                  </div>

                  {!!runResults.length && (
                    <div className="editor-output-card mt-3">
                      <div className="editor-output-heading">Detailed Results</div>

                      {runResults.map((item, index) => (
                        <div key={index} className="mb-3">
                          <div className={item.passed ? "text-success" : "text-danger"}>
                            Test Case {item.testcase || index + 1}:{" "}
                            {item.passed ? "Passed" : "Failed"}
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
                    {submitResult
                      ? `Problem: ${submitResult.title}
Verdict: ${getVerdictLabel(submitResult.status)}
Score: ${submitResult.score ?? 0}
Runtime: ${submitResult.runtime ?? 0}
Passed Testcases: ${submitResult.passed_testcases ?? 0}/${submitResult.total_testcases ?? 0}`
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

export default ProblemEditorPage;