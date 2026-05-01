import React from "react";
import { Button } from "react-bootstrap";
import { formatTime } from "../../utils/editorUtils";
import ThemeToggle from "../ThemeToggle";

export default function ContestTopbar({
  contestInfo,
  contestTime = 0,
  activeTime = 0,
  runLoading = false,
  submitLoading = false,
  onRun,
  onSubmit,
  onFinish,
  onBack,
  problemList = [],
  contestEnded = false,   // 🔥 ADD THIS LINE
}) {
  const contestTitle = contestInfo?.name || "Contest";
  const contestStatus = contestInfo?.status || "Live";

  return (
    <div className="editor-topbar editor-topbar-theme d-flex align-items-center justify-content-between px-3 border-bottom">
      <div className="d-flex align-items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={onBack}
          className="btn btn-link text-decoration-none small p-0 editor-link-btn"
        >
          ← Problem List
        </button>

        <div className="vr" />

        <span className="fw-semibold small">{contestTitle}</span>
        <span className="badge bg-success">{contestStatus}</span>
        <span className="badge bg-warning text-dark">{formatTime(contestTime)}</span>
        <span className="badge bg-secondary">
          This Problem: {formatTime(activeTime)}
        </span>
      </div>

      <div className="d-flex gap-2 flex-wrap">
        <Button size="sm" variant="outline-secondary" onClick={onRun} disabled={runLoading}>
          {runLoading ? "Running..." : "Run"}
        </Button>

        <Button
          size="sm"
          variant="primary"
          onClick={onSubmit}
          disabled={submitLoading || problemList.length === 0}
        >
          {submitLoading ? "Submitting..." : "Submit Problem"}
        </Button>

        <Button
          size="sm"
          variant="success"
          onClick={onFinish}
          disabled={contestEnded}
        >
          Finish Contest
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );
}