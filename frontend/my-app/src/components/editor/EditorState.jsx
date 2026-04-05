import React from "react";
import { Spinner, Button } from "react-bootstrap";

export function EditorLoadingState({ message = "Loading editor..." }) {
  return (
    <div className="contest-editor-layout editor-page-theme d-flex align-items-center justify-content-center">
      <div className="text-center">
        <Spinner animation="border" className="mb-3" />
        <div className="text-muted-custom">{message}</div>
      </div>
    </div>
  );
}

export function EditorErrorState({
  title = "Failed to load editor",
  message = "Something went wrong.",
  onRetry,
}) {
  return (
    <div className="contest-editor-layout editor-page-theme d-flex align-items-center justify-content-center px-3">
      <div
        className="card card-theme border-0 shadow-sm rounded-4"
        style={{ maxWidth: "560px", width: "100%" }}
      >
        <div className="card-body p-4 text-center">
          <h5 className="mb-2">{title}</h5>
          <p className="text-muted-custom mb-3">{message}</p>
          {onRetry && <Button onClick={onRetry}>Retry</Button>}
        </div>
      </div>
    </div>
  );
}