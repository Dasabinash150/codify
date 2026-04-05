import React from "react";
import { useParams } from "react-router-dom";

import CodeEditorPanel from "../components/editor/CodeEditorPanel";
import ProblemDetailsPanel from "../components/editor/ProblemDetailsPanel";
import ProblemTopbar from "../components/editor/ProblemTopbar";
import ProblemBottomPanel from "../components/editor/ProblemBottomPanel";
import EditorPageShell from "../components/editor/EditorPageShell";
import {
  EditorLoadingState,
  EditorErrorState,
} from "../components/editor/EditorState";

import useEditorLayout from "../hooks/useEditorLayout";
import usePersistedEditorLayout from "../hooks/usePersistedEditorLayout";
import useTheme from "../hooks/useTheme";
import useProblemEditor from "../hooks/useProblemEditor";

import "../styles/ContestEditorPage.css";
import "../styles/global.css";
import "../styles/variables.css";

export default function ProblemEditorPage() {
  const { id } = useParams();

  const layout = useEditorLayout(45, 240);
  const { isDarkTheme } = useTheme();
  const editor = useProblemEditor(id);

  usePersistedEditorLayout({
    leftPanelWidth: layout.leftPanelWidth,
    bottomPanelHeight: layout.bottomPanelHeight,
    setLeftPanelWidth: layout.setLeftPanelWidth,
    setBottomPanelHeight: layout.setBottomPanelHeight,
    savedLeftPanelWidth: editor.leftPanelWidth,
    savedBottomPanelHeight: editor.bottomPanelHeight,
    saveLeftPanelWidth: editor.setLeftPanelWidth,
    saveBottomPanelHeight: editor.setBottomPanelHeight,
  });

  if (editor.loading) {
    return <EditorLoadingState message="Loading problem editor..." />;
  }

  if (editor.error || !editor.problem) {
    return (
      <EditorErrorState
        title="Failed to load editor"
        message={editor.error || "Problem not found."}
        onRetry={editor.reloadProblem}
      />
    );
  }

  return (
    <EditorPageShell
      mainGridRef={layout.mainGridRef}
      rightPanelRef={layout.rightPanelRef}
      leftPanelWidth={layout.leftPanelWidth}
      bottomPanelHeight={layout.bottomPanelHeight}
      startHorizontalResize={layout.startHorizontalResize}
      startVerticalResize={layout.startVerticalResize}
      topRowHeight={48}
      topbar={
        <ProblemTopbar
          problem={editor.problem}
          runLoading={editor.runLoading}
          submitLoading={editor.submitLoading}
          onBack={editor.handleBackToProblems}
          onRun={editor.handleRun}
          onSubmit={editor.handleSubmit}
        />
      }
      leftContent={
        <ProblemDetailsPanel
          problem={{
            ...editor.problem,
            examples: editor.fallbackExamples,
          }}
          leftTab={editor.leftTab}
          setLeftTab={editor.setLeftTab}
        />
      }
      rightTop={
        <CodeEditorPanel
          language={editor.language}
          setLanguage={editor.setLanguage}
          currentCode={editor.currentCode}
          onChange={editor.handleEditorChange}
          isDarkTheme={isDarkTheme}
        />
      }
      rightBottom={
        <ProblemBottomPanel
          bottomTab={editor.bottomTab}
          setBottomTab={editor.setBottomTab}
          customInput={editor.customInput}
          defaultInput={editor.defaultInput}
          onCustomInputChange={editor.handleCustomInputChange}
          runSummary={editor.runSummary}
          runResults={editor.runResults}
          submitResult={editor.submitResult}
          problemTitle={editor.problem.title}
        />
      }
    />
  );
}