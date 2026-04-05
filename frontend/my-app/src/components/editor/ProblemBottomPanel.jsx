import React from "react";
import { getVerdictLabel } from "../../utils/editorUtils";

export default function ProblemBottomPanel({
  bottomTab,
  setBottomTab,
  customInput,
  defaultInput,
  onCustomInputChange,
  runSummary,
  runResults,
  submitResult,
  problemTitle,
}) {
  return (
    <div className="editor-bottom-panel">
      <div className="editor-bottom-tabs">
        <button
          type="button"
          className={`editor-bottom-tab ${bottomTab === "testcase" ? "active" : ""}`}
          onClick={() => setBottomTab("testcase")}
        >
          Testcase
        </button>

        <button
          type="button"
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
              onChange={(e) => onCustomInputChange(e.target.value)}
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
                ? `Problem: ${submitResult.title || problemTitle}
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
  );
}