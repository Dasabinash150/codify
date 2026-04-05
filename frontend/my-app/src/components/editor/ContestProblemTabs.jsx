import React from "react";

export default function ContestProblemTabs({
  problemList,
  selectedProblem,
  onProblemChange,
}) {
  return (
    <div className="editor-left-header">
      <div className="editor-problem-tabs-scroll">
        {problemList.map((problem, index) => (
          <button
            key={problem.id}
            type="button"
            className={`editor-problem-tab ${selectedProblem?.id === problem.id ? "active" : ""}`}
            onClick={() => onProblemChange(problem)}
          >
            {index + 1}. {problem.title}
          </button>
        ))}
      </div>
    </div>
  );
}