import React from "react";
import {
  getDifficultyClass,
  getStatusClass,
  parseConstraints,
  parseTags,
} from "../../utils/editorUtils";

export default function ProblemDetailsPanel({
  problem,
  leftTab,
  setLeftTab,
  showStatus = false,
}) {
  const tags = parseTags(problem?.tags);
  const constraints = parseConstraints(problem?.constraints);
  const examples = problem?.examples || [];

  return (
    <div className="editor-problem-details">
      <div className="editor-problem-title-row">
        <h2 className="editor-problem-title">
          {problem?.order ? `${problem.order}. ` : ""}
          {problem?.title}
        </h2>
      </div>

      <div className="editor-problem-badges">
        <span className={`editor-pill ${getDifficultyClass(problem?.difficulty)}`}>
          {problem?.difficulty || "Unknown"}
        </span>

        {showStatus && (
          <span className={`editor-pill ${getStatusClass(problem?.status)}`}>
            {problem?.status || "Unsolved"}
          </span>
        )}

        <span className="editor-pill editor-points-pill">
          {problem?.points ?? 100} Points
        </span>

        {tags.map((tag, index) => (
          <span key={index} className="editor-pill editor-tag-pill">
            {tag}
          </span>
        ))}
      </div>

      <div className="editor-left-tabs">
        <button
          type="button"
          className={`editor-left-tab-btn ${leftTab === "description" ? "active" : ""}`}
          onClick={() => setLeftTab("description")}
        >
          Description
        </button>

        <button
          type="button"
          className={`editor-left-tab-btn ${leftTab === "examples" ? "active" : ""}`}
          onClick={() => setLeftTab("examples")}
        >
          Examples
        </button>

        <button
          type="button"
          className={`editor-left-tab-btn ${leftTab === "constraints" ? "active" : ""}`}
          onClick={() => setLeftTab("constraints")}
        >
          Constraints
        </button>
      </div>

      <div className="editor-left-content">
        {leftTab === "description" && (
          <div className="editor-content-section">
            {String(problem?.description || "No description available.")
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
            {examples.length ? (
              examples.map((example, index) => (
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
            {constraints.length ? (
              <ul className="editor-constraints-list">
                {constraints.map((item, index) => (
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
  );
}