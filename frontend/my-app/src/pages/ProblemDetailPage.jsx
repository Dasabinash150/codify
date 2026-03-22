// ProblemDetailPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/ProblemDetailPage.css";

const sampleProblem = {
  id: 1,
  title: "Two Sum",
  difficulty: "Easy",
  acceptance: "49.2%",
  points: 100,
  description:
    "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0,1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "nums[1] + nums[2] == 6.",
    },
  ],
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists.",
  ],
  testCases: [
    { id: 1, input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
    { id: 2, input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    { id: 3, input: "nums = [3,3], target = 6", output: "[0,1]" },
  ],
};

function ProblemDetailPage() {
  const [language, setLanguage] = useState("Python");
  const [code, setCode] = useState(`def twoSum(nums, target):
    # Write your code here
    pass`);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [output, setOutput] = useState("Run your code to see the output here.");
  const [status, setStatus] = useState("Not Run");

  const handleRun = () => {
    setStatus("Running");
    setTimeout(() => {
      setStatus("Success");
      setOutput(`Input:
${sampleProblem.testCases[activeTestCase].input}

Output:
${sampleProblem.testCases[activeTestCase].output}

Status:
Accepted`);
    }, 500);
  };

  const handleSubmit = () => {
    setStatus("Submitted");
    setOutput(`Submission Result:
Accepted

Runtime: 84 ms
Memory: 42.1 MB
Passed: ${sampleProblem.testCases.length}/${sampleProblem.testCases.length} test cases`);
  };

  return (
    <div className="problem-detail-page py-4">
      <div className="container-fluid px-lg-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
              <Link to="/problems" className="text-decoration-none small page-link-back">
                ← Back to Problems
              </Link>
              <span className={`badge rounded-pill px-3 py-2 difficulty-badge difficulty-${sampleProblem.difficulty.toLowerCase()}`}>
                {sampleProblem.difficulty}
              </span>
            </div>
            <h2 className="fw-bold mb-1">{sampleProblem.title}</h2>
            <p className="text-muted mb-0">
              Acceptance: {sampleProblem.acceptance} · Points: {sampleProblem.points}
            </p>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-light border">Hints</button>
            <button className="btn btn-light border">Solutions</button>
            <button className="btn btn-primary-custom">Submit History</button>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-xl-5">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-0">
                <div className="problem-panel-header px-4 py-3 border-bottom">
                  <h5 className="mb-0 fw-semibold">Problem Description</h5>
                </div>

                <div className="p-4 description-scroll">
                  <p className="mb-4">{sampleProblem.description}</p>

                  <h6 className="fw-bold mb-3">Examples</h6>
                  {sampleProblem.examples.map((example, index) => (
                    <div key={index} className="example-box mb-3">
                      <p className="mb-2 fw-semibold">Example {index + 1}</p>
                      <p className="mb-1"><strong>Input:</strong> {example.input}</p>
                      <p className="mb-1"><strong>Output:</strong> {example.output}</p>
                      <p className="mb-0"><strong>Explanation:</strong> {example.explanation}</p>
                    </div>
                  ))}

                  <h6 className="fw-bold mb-3 mt-4">Constraints</h6>
                  <ul className="constraint-list mb-4">
                    {sampleProblem.constraints.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>

                  <h6 className="fw-bold mb-3">Test Cases</h6>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {sampleProblem.testCases.map((testCase, index) => (
                      <button
                        key={testCase.id}
                        className={`btn btn-sm testcase-btn ${activeTestCase === index ? "active-testcase" : ""}`}
                        onClick={() => setActiveTestCase(index)}
                      >
                        Case {testCase.id}
                      </button>
                    ))}
                  </div>

                  <div className="testcase-preview">
                    <p className="mb-2"><strong>Input:</strong> {sampleProblem.testCases[activeTestCase].input}</p>
                    <p className="mb-0"><strong>Expected Output:</strong> {sampleProblem.testCases[activeTestCase].output}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-7">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-0">
                <div className="editor-topbar px-3 py-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="fw-semibold">Code Editor</span>
                    <select
                      className="form-select form-select-sm language-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option>Python</option>
                      <option>JavaScript</option>
                      <option>Java</option>
                      <option>C++</option>
                    </select>
                  </div>

                  <div className="d-flex gap-2 flex-wrap">
                    <button className="btn btn-outline-secondary btn-sm">Reset</button>
                    <button className="btn btn-run btn-sm px-3" onClick={handleRun}>
                      Run
                    </button>
                    <button className="btn btn-primary-custom btn-sm px-3" onClick={handleSubmit}>
                      Submit
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  <textarea
                    className="form-control code-editor"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck="false"
                  />
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="result-header px-4 py-3 border-bottom d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-semibold">Results / Output</h5>
                  <span className={`badge rounded-pill px-3 py-2 status-pill status-${status.toLowerCase().replace(/\s+/g, "-")}`}>
                    {status}
                  </span>
                </div>

                <div className="p-4">
                  <pre className="output-box mb-0">{output}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemDetailPage;