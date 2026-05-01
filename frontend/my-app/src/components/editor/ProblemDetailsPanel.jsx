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



      <div className="editor-left-content">

        {/* DESCRIPTION */}
        <section className="editor-section">
          <h5 className="editor-section-title">📝 Description</h5>

          {String(problem?.description || "No description available.")
            .split("\n\n")
            .map((para, index) => (
              <p key={index} className="editor-text">
                {para}
              </p>
            ))}
        </section>

        {/* EXAMPLES */}
        <section className="editor-section">
          <h5 className="editor-section-title">📌 Examples</h5>

          {examples.length ? (
            examples.map((example, index) => (
              <div key={index} className="editor-example-card">

                <div className="example-header">
                  Example {index + 1}
                </div>

                <div className="editor-example-block">
                  <span className="label">Input</span>
                  <pre>{example.input}</pre>
                </div>

                <div className="editor-example-block">
                  <span className="label">Output</span>
                  <pre>{example.output}</pre>
                </div>

                {example.explanation && (
                  <div className="editor-example-block">
                    <span className="label">Explanation</span>
                    <pre>{example.explanation}</pre>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="editor-text">No sample examples available.</p>
          )}
        </section>

        {/* CONSTRAINTS */}
        <section className="editor-section">
          <h5 className="editor-section-title">⚡ Constraints</h5>

          {constraints.length ? (
            <ul className="editor-constraints-list">
              {constraints.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="editor-text">No constraints available.</p>
          )}
        </section>

      </div>
    </div>
  );
}