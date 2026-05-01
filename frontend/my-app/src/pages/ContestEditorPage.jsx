import React from "react";
import { useParams } from "react-router-dom";

import CodeEditorPanel from "../components/editor/CodeEditorPanel";
import ProblemDetailsPanel from "../components/editor/ProblemDetailsPanel";
import ContestTopbar from "../components/editor/ContestTopbar";
import ContestProblemTabs from "../components/editor/ContestProblemTabs";
import ContestBottomPanel from "../components/editor/ContestBottomPanel";
import EditorPageShell from "../components/editor/EditorPageShell";
import {
  EditorLoadingState,
  EditorErrorState,
} from "../components/editor/EditorState";

import useEditorLayout from "../hooks/useEditorLayout";
import usePersistedEditorLayout from "../hooks/usePersistedEditorLayout";
import useTheme from "../hooks/useTheme";
import useContestEditor from "../hooks/useContestEditor";

import "../styles/ContestEditorPage.css";
import "../styles/global.css";
import "../styles/variables.css";

export default function ContestEditorPage() {
  const { id, problemId } = useParams();

  const layout = useEditorLayout(45, 260);
  const { isDarkTheme } = useTheme();
  const editor = useContestEditor(id, problemId);

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
    return <EditorLoadingState message="Loading contest editor..." />;
  }

  if (editor.error) {
    return (
      <EditorErrorState
        title="Failed to load editor"
        message={editor.error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!editor.selectedProblem) {
    return (
      <EditorErrorState
        title="Problem not found"
        message="No problem found for this contest."
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
      topRowHeight={52}
      topbar={
        <ContestTopbar
          contestInfo={editor.contestInfo}
          contestTime={editor.contestTime}
          contestEnded={editor.contestEnded}
          activeTime={editor.activeTime}
          runLoading={editor.runLoading}
          submitLoading={editor.submitLoading}
          onBack={editor.handleBackToProblems}
          onRun={editor.handleRun}
          onSubmit={editor.handleSubmit}
          onFinish={editor.handleFinishContest}
          problemList={editor.problemList}
          
        />
      }
      leftHeader={
        <ContestProblemTabs
          problemList={editor.problemList}
          selectedProblem={editor.selectedProblem}
          onProblemChange={editor.handleProblemChange}
        />
      }
      leftContent={
        <ProblemDetailsPanel
          problem={editor.selectedProblem}
          submittedProblemIds={editor.submittedProblemIds}
          leftTab={editor.leftTab}
          setLeftTab={editor.setLeftTab}
          showStatus={true}
        />
      }
      rightTop={
        <CodeEditorPanel
          language={editor.language}
          setLanguage={editor.setLanguage}
          currentCode={editor.currentCode}
          onChange={editor.handleEditorChange}
          isDarkTheme={isDarkTheme}
          contestEnded={editor.contestEnded} 
        />
      }
      rightBottom={
        <ContestBottomPanel
          bottomTab={editor.bottomTab}
          setBottomTab={editor.setBottomTab}
          selectedProblem={editor.selectedProblem}
          customInputMap={editor.customInputMap}
          onCustomInputChange={editor.handleCustomInputChange}
          selectedRunSummary={editor.selectedRunSummary}
          selectedRunResults={editor.selectedRunResults}
          selectedSubmitResult={editor.selectedSubmitResult}
          selectedSubmissionMeta={editor.selectedSubmissionMeta}
          submissionHistory={editor.submissionHistory}
          historyLoading={editor.historyLoading}
          onRefreshHistory={editor.loadSubmissionHistory}
        />
      }
    />
  );
}