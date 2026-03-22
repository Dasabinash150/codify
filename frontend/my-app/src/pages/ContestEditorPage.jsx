import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import Editor from "@monaco-editor/react";
import "../styles/ContestEditorPage.css";
import "../styles/global.css";
import "../styles/variables.css";

const contestInfo = {
  id: 12,
  title: "Weekly Coding Challenge 12",
  status: "Live",
  timeLeft: "00:42:15",
};

const problemList = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    status: "Solved",
    points: 100,
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0,1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1,2].",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 6, we return [0,1].",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    testcases: "nums = [2,7,11,15]\ntarget = 9",
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Write your code here
  
}`,
      python: `def two_sum(nums, target):
    # Write your code here
    pass`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
        
    }
};`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        
    }
}`,
    },
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["String", "Stack"],
    status: "Unsolved",
    points: 100,
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets are closed by the same type of brackets.
2. Open brackets are closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: `s = "()"`,
        output: "true",
        explanation: "The brackets are matched correctly.",
      },
      {
        input: `s = "()[]{}"`,
        output: "true",
        explanation: "All brackets are valid and properly ordered.",
      },
      {
        input: `s = "(]"`,
        output: "false",
        explanation: "The closing bracket does not match the last open bracket.",
      },
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'.",
    ],
    testcases: `s = "()[]{}"`,
    starterCode: {
      javascript: `function isValid(s) {
  // Write your code here
  
}`,
      python: `def is_valid(s):
    # Write your code here
    pass`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        // Write your code here
        
    }
};`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Write your code here
        
    }
}`,
    },
  },
];

function ContestEditorPage() {
  const { id, problemId } = useParams();

  const initialProblemId = Number(problemId) || 1;

  const [selectedProblemId, setSelectedProblemId] = useState(initialProblemId);
  const [language, setLanguage] = useState("cpp");
  const [leftTab, setLeftTab] = useState("description");
  const [bottomTab, setBottomTab] = useState("testcase");
  const [customInput, setCustomInput] = useState("");
  const [runOutput, setRunOutput] = useState("Run your code to see output here.");
  const [resultOutput, setResultOutput] = useState("Submission result will appear here.");

  const selectedProblem = useMemo(() => {
    return (
      problemList.find((problem) => problem.id === selectedProblemId) || problemList[0]
    );
  }, [selectedProblemId]);

  const [codeStore, setCodeStore] = useState(() => {
    const store = {};
    problemList.forEach((problem) => {
      store[problem.id] = {
        javascript: problem.starterCode.javascript,
        python: problem.starterCode.python,
        cpp: problem.starterCode.cpp,
        java: problem.starterCode.java,
      };
    });
    return store;
  });

  const editorLanguageMap = {
    javascript: "javascript",
    python: "python",
    cpp: "cpp",
    java: "java",
  };

  const currentCode = codeStore[selectedProblem.id][language];

  const handleProblemChange = (problem) => {
    setSelectedProblemId(problem.id);
    setLeftTab("description");
    setBottomTab("testcase");
    setCustomInput(problem.testcases || "");
    setRunOutput("Run your code to see output here.");
    setResultOutput("Submission result will appear here.");
  };

  const handleEditorChange = (value) => {
    setCodeStore((prev) => ({
      ...prev,
      [selectedProblem.id]: {
        ...prev[selectedProblem.id],
        [language]: value || "",
      },
    }));
  };

  const handleRun = () => {
    const inputToShow = customInput || selectedProblem.testcases;
    setBottomTab("testcase");
    setRunOutput(
      `Input:
${inputToShow}

Status:
Passed sample test

Execution Time:
0.12 sec

Memory:
14.3 MB`
    );
  };

  const handleSubmit = () => {
    setBottomTab("result");
    setResultOutput(
      `Verdict: Accepted

Problem: ${selectedProblem.title}
Language: ${language.toUpperCase()}
Score: ${selectedProblem.points}/${selectedProblem.points}
Runtime: 52 ms
Memory: 14.8 MB`
    );
  };

  const getDifficultyClass = (difficulty) => {
    const value = difficulty.toLowerCase();
    if (value === "easy") return "editor-badge-easy";
    if (value === "medium") return "editor-badge-medium";
    if (value === "hard") return "editor-badge-hard";
    return "editor-badge-default";
  };

  const getStatusClass = (status) => {
    const value = status.toLowerCase();
    if (value === "solved") return "editor-status-solved";
    if (value === "attempted") return "editor-status-attempted";
    return "editor-status-unsolved";
  };

  return (
    <div className="contest-editor-layout">
      <div className="editor-topbar d-flex align-items-center justify-content-between px-3 border-bottom bg-dark text-light">

        {/* LEFT */}
        <div className="d-flex align-items-center gap-3">

          <Link
            to={`/contest/${id || contestInfo.id}`}
            className="text-decoration-none text-light small"
          >
            ← Problem List
          </Link>

          <div className="vr"></div>

          <span className="fw-semibold small">
            {contestInfo.title}
          </span>

          <span className="badge bg-success">
            {contestInfo.status}
          </span>

          <span className="badge bg-warning text-dark">
            {contestInfo.timeLeft}
          </span>

        </div>

        {/* RIGHT */}
        <div className="d-flex gap-2">

          <Button
            size="sm"
            variant="outline-light"
            onClick={handleRun}
          >
            Run
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleSubmit}
          >
            Submit
          </Button>

        </div>

      </div>

      <div className="editor-main-grid">
        <aside className="editor-left-panel">
          <div className="editor-left-header">
            <div className="editor-problem-tabs-scroll">
              {problemList.map((problem) => (
                <button
                  key={problem.id}
                  className={`editor-problem-tab ${selectedProblem.id === problem.id ? "active" : ""
                    }`}
                  onClick={() => handleProblemChange(problem)}
                >
                  {problem.id}. {problem.title}
                </button>
              ))}
            </div>
          </div>

          <div className="editor-problem-details">
            <div className="editor-problem-title-row">
              <h2 className="editor-problem-title">
                {selectedProblem.id}. {selectedProblem.title}
              </h2>
            </div>

            <div className="editor-problem-badges">
              <span className={`editor-pill ${getDifficultyClass(selectedProblem.difficulty)}`}>
                {selectedProblem.difficulty}
              </span>
              <span className={`editor-pill ${getStatusClass(selectedProblem.status)}`}>
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
                  {selectedProblem.description.split("\n\n").map((para, index) => (
                    <p key={index} className="editor-text">
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {leftTab === "examples" && (
                <div className="editor-content-section">
                  {selectedProblem.examples.map((example, index) => (
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
                  ))}
                </div>
              )}

              {leftTab === "constraints" && (
                <div className="editor-content-section">
                  <h6 className="editor-section-heading">Constraints</h6>
                  <ul className="editor-constraints-list">
                    {selectedProblem.constraints.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
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
                className={`editor-bottom-tab ${bottomTab === "testcase" ? "active" : ""}`}
                onClick={() => setBottomTab("testcase")}
              >
                Testcase
              </button>
              <button
                className={`editor-bottom-tab ${bottomTab === "result" ? "active" : ""}`}
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
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder={selectedProblem.testcases}
                  />
                  <div className="editor-output-card">
                    <div className="editor-output-heading">Output</div>
                    <pre className="editor-output-pre">{runOutput}</pre>
                  </div>
                </div>
              )}

              {bottomTab === "result" && (
                <div className="editor-output-card editor-output-card-full">
                  <div className="editor-output-heading">Submission Result</div>
                  <pre className="editor-output-pre">{resultOutput}</pre>
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