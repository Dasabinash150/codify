import React from "react";
import { Button, Spinner, Table, Badge } from "react-bootstrap";
import { formatDateTime, getVerdictLabel } from "../../utils/editorUtils";

function getVerdictBadge(status) {
  const value = String(status || "").toUpperCase();

  if (value === "AC" || value === "ACCEPTED") return <Badge bg="success">Accepted</Badge>;
  if (value === "WA") return <Badge bg="danger">Wrong Answer</Badge>;
  if (value === "TLE") return <Badge bg="warning" text="dark">TLE</Badge>;
  if (value === "RE") return <Badge bg="secondary">Runtime Error</Badge>;
  if (value === "CE") return <Badge bg="dark">Compilation Error</Badge>;

  return <Badge bg="info">Pending</Badge>;
}

export default function ContestBottomPanel({
  bottomTab,
  setBottomTab,
  selectedProblem,
  customInputMap,
  onCustomInputChange,
  selectedRunSummary,
  selectedRunResults,
  selectedSubmitResult,
  selectedSubmissionMeta,
  submissionHistory,
  historyLoading,
  onRefreshHistory,
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
          Submission Result
        </button>

        <button
          type="button"
          className={`editor-bottom-tab ${bottomTab === "history" ? "active" : ""}`}
          onClick={() => {
            console.log("History tab clicked");
            console.log("selectedProblem:", selectedProblem);
            console.log("submissionHistory BEFORE refresh:", submissionHistory);

            setBottomTab("history");

            if (typeof onRefreshHistory === "function") {
              console.log("Calling onRefreshHistory()");
              onRefreshHistory();
            } else {
              console.log("onRefreshHistory is NOT a function");
            }
          }}
        >
          Submission History
        </button>
      </div>

      <div className="editor-bottom-content">
        {bottomTab === "testcase" && (
          <div className="editor-testcase-section">
            <label className="editor-input-label">Custom Input</label>

            <textarea
              className="editor-custom-input"
              value={customInputMap[selectedProblem?.id] || ""}
              onChange={(e) => onCustomInputChange(e.target.value)}
              placeholder={selectedProblem?.testcases || "Enter custom input"}
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
                    <div className="d-flex align-items-center gap-2">
                      <span className={item.passed ? "text-success" : "text-danger"}>
                        {item.testcase === "Custom Input"
                          ? "Custom Input"
                          : `Test Case ${item.testcase || index + 1}`}
                      </span>

                      <span>{item.passed ? "✅" : "❌"}</span>

                      {item.testcase === "Custom Input" && (
                        <span className="badge bg-info">Custom</span>
                      )}
                    </div>

                    <pre className="editor-output-pre mb-2">
                      {item.testcase === "Custom Input" ? (
                        <>
                          <div className="mb-2">
                            <strong>Input:</strong>
                            <pre className="mb-1">{item.input}</pre>
                          </div>

                          <div>
                            <strong>
                              {item.judge_status === "ERROR" ? "Error:" : "Output:"}
                            </strong>
                            <pre
                              className="mb-1"
                              style={{
                                color: item.judge_status === "ERROR" ? "#ff6b6b" : "inherit",
                              }}
                            >
                              {item.actual_output || "(no output)"}
                            </pre>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mb-2">
                            <strong>Expected:</strong>
                            <pre className="mb-1">{item.expected_output}</pre>
                          </div>

                          <div>
                            <strong>Actual:</strong>
                            <pre
                              className="mb-1"
                              style={{
                                color: item.passed ? "inherit" : "#ff6b6b",
                              }}
                            >
                              {item.actual_output || "(no output)"}
                            </pre>
                          </div>
                        </>
                      )}
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

            {selectedSubmissionMeta?.status === "PENDING" && (
              <div className="text-warning mb-2">
                Submission is in queue. Waiting for judge result...
              </div>
            )}

            <pre className="editor-output-pre">
              {selectedSubmitResult
                ? `Problem: ${selectedSubmitResult.title || selectedProblem?.title || "Problem"}
Verdict: ${getVerdictLabel(selectedSubmitResult.status)}
Score: ${selectedSubmitResult.score ?? 0}
Runtime: ${selectedSubmitResult.runtime ?? 0}
Passed Testcases: ${selectedSubmitResult.passed_testcases ?? 0}/${selectedSubmitResult.total_testcases ?? 0}
`
                : "Submission result will appear here."}
            </pre>
          </div>
        )}

        {bottomTab === "history" && (
          <div className="editor-output-card editor-output-card-full">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="editor-output-heading mb-0">Submission History</div>

              <Button size="sm" variant="outline-secondary" onClick={onRefreshHistory}>
                Refresh
              </Button>
            </div>

            {historyLoading ? (
              <div className="py-4 text-center">
                <Spinner animation="border" size="sm" />
              </div>
            ) : submissionHistory.length > 0 ? (
              <div className="table-responsive">
                <Table striped hover responsive className="align-middle mb-0 theme-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Status</th>
                      <th>Language</th>
                      <th>Runtime</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissionHistory.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td>{getVerdictBadge(item.status)}</td>
                        <td>{item.language || "N/A"}</td>
                        <td>{item.runtime ?? "-"}</td>
                        <td>{formatDateTime(item.created_at || item.submitted_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-muted-custom">No submissions yet for this problem.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}