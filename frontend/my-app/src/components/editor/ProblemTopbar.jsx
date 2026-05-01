import React from "react";
import { Button } from "react-bootstrap";
import ThemeToggle from "../ThemeToggle";
import useFullscreen from "../../hooks/useFullscreen";

export default function ProblemTopbar({
  problem,
  runLoading = false,
  submitLoading = false,
  onBack,
  onRun,
  onSubmit,
}) {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

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

        <span className="fw-semibold small">{problem?.title || "Problem"}</span>
      </div>

      <div className="d-flex gap-2 flex-wrap">
        <button
          className="fullscreen-btn"
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
        >
          {isFullscreen ? "⤡" : "⛶"}
        </button>
        <Button
          size="sm"
          variant="outline-secondary"
          onClick={onRun}
          disabled={runLoading}
        >
          {runLoading ? "Running..." : "Run"}
        </Button>

        <Button
          size="sm"
          variant="primary"
          onClick={onSubmit}
          disabled={submitLoading}
        >
          {submitLoading ? "Submitting..." : "Submit"}
        </Button>

        <ThemeToggle />
      </div>
    </div>
  );
}