import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getProblemById,
  getProblemTestCases,
  runProblemCode,
  submitProblemCode,
} from "../services/problemApi";
import "bootstrap/dist/css/bootstrap.min.css";

const LANGUAGE_OPTIONS = [
  { label: "Python", value: "python", judge0: 71 },
  { label: "JavaScript", value: "javascript", judge0: 63 },
  { label: "Java", value: "java", judge0: 62 },
  { label: "C++", value: "cpp", judge0: 54 },
];

const DEFAULT_SNIPPETS = {
  python: `def solve():
    # write your code here
    pass

solve()
`,
  javascript: `function solve() {
  // write your code here
}

solve();
`,
  java: `public class Main {
    public static void main(String[] args) {
        // write your code here
    }
}
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // write your code here
    return 0;
}
`,
};

function ProblemEditorPage() {
  const { id } = useParams();

  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [activeCase, setActiveCase] = useState(0);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(DEFAULT_SNIPPETS.python);
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("Run your code to see output here.");
  const [status, setStatus] = useState("Idle");
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentLanguage = useMemo(
    () => LANGUAGE_OPTIONS.find((item) => item.value === language),
    [language]
  );

  useEffect(() => {
    const savedCode = localStorage.getItem(`problem_code_${id}_${language}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(DEFAULT_SNIPPETS[language] || "");
    }
  }, [id, language]);

  useEffect(() => {
    localStorage.setItem(`problem_code_${id}_${language}`, code);
  }, [id, language, code]);

  useEffect(() => {
    const loadProblem = async () => {
      try {
        setLoadingProblem(true);

        const [problemRes, testCaseRes] = await Promise.all([
          getProblemById(id),
          getProblemTestCases(id),
        ]);

        setProblem(problemRes.data);
        setTestCases(Array.isArray(testCaseRes.data) ? testCaseRes.data : []);
      } catch (error) {
        console.error("Problem load error:", error);
        setOutput("Failed to load problem details.");
        setStatus("Error");
      } finally {
        setLoadingProblem(false);
      }
    };

    loadProblem();
  }, [id]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleReset = () => {
    const freshCode = DEFAULT_SNIPPETS[language] || "";
    setCode(freshCode);
    localStorage.setItem(`problem_code_${id}_${language}`, freshCode);
  };

  const handleUseSampleInput = () => {
    if (testCases.length > 0) {
      setCustomInput(testCases[activeCase]?.input || "");
    }
  };

  const handleRun = async () => {
    try {
      setRunning(true);
      setStatus("Running");
      setOutput("Running code...");

      const payload = {
        source_code: code,
        language_id: currentLanguage.judge0,
        stdin: customInput || testCases[activeCase]?.input || "",
      };

      const res = await runProblemCode(payload);

      const data = res.data || {};
      const stdout = data.stdout || "";
      const stderr = data.stderr || "";
      const compile_output = data.compile_output || "";
      const message = data.message || "";

      setStatus(data.status?.description || "Completed");

      setOutput(
        [
          stdout ? `STDOUT:\n${stdout}` : "",
          stderr ? `STDERR:\n${stderr}` : "",
          compile_output ? `COMPILE OUTPUT:\n${compile_output}` : "",
          message ? `MESSAGE:\n${message}` : "",
        ]
          .filter(Boolean)
          .join("\n\n") || "No output"
      );
    } catch (error) {
      console.error("Run error:", error);
      setStatus("Run Failed");
      setOutput(
        error?.response?.data?.error ||
          error?.response?.data?.detail ||
          "Something went wrong while running code."
      );
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setStatus("Submitting");
      setOutput("Submitting code...");

      const payload = {
        problem_id: Number(id),
        source_code: code,
        language_id: currentLanguage.judge0,
      };

      const res = await submitProblemCode(payload);
      const data = res.data || {};

      if (data.results && Array.isArray(data.results)) {
        const formatted = data.results
          .map(
            (item, index) =>
              `Test Case ${index + 1}
Passed: ${item.passed ? "Yes" : "No"}
Expected: ${item.expected_output ?? ""}
Actual: ${item.actual_output ?? ""}
`
          )
          .join("\n");

        setOutput(
          `Passed: ${data.passed ?? 0}/${data.total ?? 0}\n\n${formatted}`
        );
      } else {
        setOutput(JSON.stringify(data, null, 2));
      }

      setStatus(
        data.passed === data.total && data.total > 0 ? "Accepted" : "Evaluated"
      );
    } catch (error) {
      console.error("Submit error:", error);
      setStatus("Submit Failed");
      setOutput(
        error?.response?.data?.error ||
          error?.response?.data?.detail ||
          "Something went wrong while submitting code."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProblem) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="text-center py-5">
            <div className="spinner-border" role="status" />
            <p className="mt-3 mb-0">Loading problem...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!problem) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger">Problem not found.</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="container-fluid py-4">
        <div className="row g-4">
          <div className="col-xl-5">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                  <div>
                    <Link to="/problems" className="text-decoration-none small">
                      ← Back to Problems
                    </Link>
                    <h2 className="fw-bold mt-2 mb-1">{problem.title}</h2>
                    <div className="text-muted">
                      Difficulty: {problem.difficulty} · Points: {problem.points ?? 100}
                    </div>
                  </div>

                  <span className="badge bg-primary rounded-pill px-3 py-2">
                    Problem #{problem.id}
                  </span>
                </div>

                <hr />

                <div className="mb-4">
                  <h5 className="fw-semibold">Description</h5>
                  <p className="mb-0">{problem.description}</p>
                </div>

                {problem.constraints && (
                  <div className="mb-4">
                    <h5 className="fw-semibold">Constraints</h5>
                    <div>{problem.constraints}</div>
                  </div>
                )}

                <div className="mb-3">
                  <h5 className="fw-semibold">Sample Test Cases</h5>

                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {testCases.map((item, index) => (
                      <button
                        key={item.id || index}
                        className={`btn btn-sm ${
                          activeCase === index ? "btn-primary" : "btn-outline-secondary"
                        }`}
                        onClick={() => setActiveCase(index)}
                      >
                        Case {index + 1}
                      </button>
                    ))}
                  </div>

                  {testCases.length > 0 ? (
                    <div className="border rounded p-3 bg-light">
                      <p className="mb-2">
                        <strong>Input:</strong>
                      </p>
                      <pre className="mb-3">{testCases[activeCase]?.input}</pre>

                      <p className="mb-2">
                        <strong>Expected Output:</strong>
                      </p>
                      <pre className="mb-0">{testCases[activeCase]?.expected_output}</pre>
                    </div>
                  ) : (
                    <div className="alert alert-secondary mb-0">
                      No sample test cases found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-7">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white border-0 py-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="fw-semibold">Code Editor</span>

                    <select
                      className="form-select form-select-sm"
                      style={{ width: "160px" }}
                      value={language}
                      onChange={handleLanguageChange}
                    >
                      {LANGUAGE_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleReset}
                    >
                      Reset
                    </button>

                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={handleUseSampleInput}
                    >
                      Use Sample
                    </button>

                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleRun}
                      disabled={running}
                    >
                      {running ? "Running..." : "Run"}
                    </button>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-body pt-0">
                <textarea
                  className="form-control font-monospace"
                  style={{
                    minHeight: "420px",
                    resize: "vertical",
                    whiteSpace: "pre",
                  }}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white fw-semibold">Custom Input</div>
              <div className="card-body">
                <textarea
                  className="form-control font-monospace"
                  rows="6"
                  placeholder="Enter custom input for Run..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                />
              </div>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Results / Output</span>
                <span className="badge bg-dark">{status}</span>
              </div>
              <div className="card-body">
                <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                  {output}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default ProblemEditorPage;