import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Form, Spinner } from "react-bootstrap";
import Editor from "@monaco-editor/react";
import useContestSocket from "../hooks/useContestSocket";
import API from "../services/api";
import "../styles/ContestEditorPage.css";
import "../styles/global.css";
import "../styles/variables.css";

const editorLanguageMap = {
  javascript: "javascript",
  python: "python",
  cpp: "cpp",
  java: "java",
};

const judge0LanguageMap = {
  cpp: 54,
  python: 71,
  javascript: 63,
  java: 62,
};

const starterTemplates = {
  javascript: `function solve() {
  // Write your code here
  
}

solve();`,
  python: `def solve():
    # Write your code here
    pass

solve()`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Write your code here
    
    return 0;
}`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function ContestEditorPage() {
  const { id, problemId } = useParams();
  const navigate = useNavigate();

  const contestDraftKey = useMemo(() => `contest_draft_${id}`, [id]);

  const mainGridRef = useRef(null);
  const rightPanelRef = useRef(null);
  const dragStateRef = useRef(null);
  const isDraftHydratedRef = useRef(false);
  const problemStartRef = useRef(Date.now());

  const [contestInfo, setContestInfo] = useState(null);
  const [problemList, setProblemList] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState(
    problemId ? Number(problemId) : null
  );

  const [language, setLanguage] = useState("python");
  const [leftTab, setLeftTab] = useState("description");
  const [bottomTab, setBottomTab] = useState("testcase");

  const [customInputMap, setCustomInputMap] = useState({});
  const [runSummary, setRunSummary] = useState({});
  const [runResults, setRunResults] = useState({});
  const [submitResults, setSubmitResults] = useState({});
  const [submissionMeta, setSubmissionMeta] = useState({});

  const [codeStore, setCodeStore] = useState({});
  const [loading, setLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  const [contestTime, setContestTime] = useState(0);
  const [activeTime, setActiveTime] = useState(0);
  const [problemTimeMap, setProblemTimeMap] = useState({});
  const [submittedProblemIds, setSubmittedProblemIds] = useState({});
  const [leftPanelWidth, setLeftPanelWidth] = useState(45);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(240);

  useContestSocket(id, (msg) => {
    if (msg.event === "submission_update") {
      console.log("Submission update:", msg.data);
    }

    if (msg.event === "participant_count_update") {
      console.log("Participants:", msg.data?.participant_count);
    }
  });

  const selectedProblem = useMemo(() => {
    if (!problemList.length) return null;
    return (
      problemList.find((problem) => problem.id === Number(selectedProblemId)) ||
      problemList[0]
    );
  }, [problemList, selectedProblemId]);

  const currentCode = selectedProblem
    ? codeStore?.[selectedProblem.id]?.[language] || starterTemplates[language]
    : starterTemplates[language];

  const getDefaultInputForProblem = useCallback((problem) => {
    return problem?.testcases || "";
  }, []);

  const clearContestDraft = useCallback(() => {
    localStorage.removeItem(contestDraftKey);
  }, [contestDraftKey]);

  const clearProblemDraft = useCallback(
    (problemIdToClear) => {
      try {
        const savedDraft = localStorage.getItem(contestDraftKey);
        if (!savedDraft) return;

        const parsedDraft = JSON.parse(savedDraft);

        if (parsedDraft?.codeStore?.[problemIdToClear]) {
          delete parsedDraft.codeStore[problemIdToClear];
        }

        if (parsedDraft?.customInputMap?.[problemIdToClear] !== undefined) {
          delete parsedDraft.customInputMap[problemIdToClear];
        }

        if (parsedDraft?.submittedProblemIds) {
          parsedDraft.submittedProblemIds[problemIdToClear] = true;
        }

        localStorage.setItem(contestDraftKey, JSON.stringify(parsedDraft));
      } catch (draftError) {
        console.error("Draft cleanup failed:", draftError);
      }
    },
    [contestDraftKey]
  );

  const formatTime = (sec) => {
    const safe = Math.max(0, Number(sec) || 0);
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60);
    const s = safe % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
      s
    ).padStart(2, "0")}`;
  };

  const buildCodeStore = (problems) => {
    const store = {};
    problems.forEach((problem) => {
      store[problem.id] = {
        javascript: starterTemplates.javascript,
        python: starterTemplates.python,
        cpp: starterTemplates.cpp,
        java: starterTemplates.java,
      };
    });
    return store;
  };

  const getDraftableData = useCallback(() => {
    const draftableCodeStore = {};
    const draftableCustomInputMap = {};

    problemList.forEach((problem) => {
      if (submittedProblemIds[problem.id]) return;

      const perProblemCode = codeStore[problem.id] || {};
      const currentInput = customInputMap[problem.id] ?? "";
      const defaultInput = getDefaultInputForProblem(problem);

      const hasCodeForAnyLanguage = Object.entries(starterTemplates).some(
        ([lang, template]) => {
          const value = perProblemCode[lang] ?? template;
          return value !== template;
        }
      );

      if (hasCodeForAnyLanguage) {
        draftableCodeStore[problem.id] = {
          javascript: perProblemCode.javascript ?? starterTemplates.javascript,
          python: perProblemCode.python ?? starterTemplates.python,
          cpp: perProblemCode.cpp ?? starterTemplates.cpp,
          java: perProblemCode.java ?? starterTemplates.java,
        };
      }

      if (currentInput !== defaultInput) {
        draftableCustomInputMap[problem.id] = currentInput;
      }
    });

    return {
      codeStore: draftableCodeStore,
      customInputMap: draftableCustomInputMap,
    };
  }, [
    codeStore,
    customInputMap,
    getDefaultInputForProblem,
    problemList,
    submittedProblemIds,
  ]);

  const hasUnsavedWork = useMemo(() => {
    const { codeStore: draftableCodeStore, customInputMap: draftableCustomInputMap } =
      getDraftableData();

    return (
      Object.keys(draftableCodeStore).length > 0 ||
      Object.keys(draftableCustomInputMap).length > 0
    );
  }, [getDraftableData]);

  const parseTags = (tagsValue) => {
    if (!tagsValue) return [];
    if (Array.isArray(tagsValue)) return tagsValue;

    return String(tagsValue)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  };

  const parseConstraints = (constraintsValue) => {
    if (!constraintsValue) return [];

    return String(constraintsValue)
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const getDifficultyClass = (difficulty) => {
    const value = String(difficulty || "").toLowerCase();
    if (value === "easy") return "editor-badge-easy";
    if (value === "medium") return "editor-badge-medium";
    if (value === "hard") return "editor-badge-hard";
    return "editor-badge-default";
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();
    if (value === "solved") return "editor-status-solved";
    if (value === "attempted") return "editor-status-attempted";
    return "editor-status-unsolved";
  };

  const getVerdictLabel = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "AC") return "Accepted";
    if (value === "WA") return "Wrong Answer";
    if (value === "TLE") return "Time Limit Exceeded";
    if (value === "RE") return "Runtime Error";
    if (value === "CE") return "Compilation Error";
    if (value === "PENDING") return "Pending";

    return value || "Unknown";
  };

  const normalizeProblemData = (problem, contestProblem, allTestcases, solvedMap) => {
    const problemTestcases = allTestcases.filter(
      (tc) => Number(tc.problem) === Number(problem.id)
    );

    const sampleTestcases = problemTestcases.filter((tc) => tc.is_sample);
    const firstSample = sampleTestcases[0] || problemTestcases[0] || null;

    const examples = sampleTestcases.map((tc, index) => ({
      input: tc.input,
      output: tc.expected_output,
      explanation: `Sample testcase ${index + 1}`,
    }));

    return {
      id: problem.id,
      contest_problem_id: contestProblem.id,
      order: contestProblem.order,
      title: problem.title,
      description: problem.description || "No description available.",
      difficulty: problem.difficulty || "easy",
      constraints: parseConstraints(problem.constraints),
      tags: parseTags(problem.tags),
      points: problem.points || 100,
      status: solvedMap[problem.id] ? "Solved" : "Unsolved",
      examples,
      testcases: firstSample?.input || "",
      testcaseObjects: problemTestcases,
    };
  };

  const initializeContest = async () => {
    try {
      setLoading(true);
      setError("");

      const contestRes = await API.get(`/contests/${id}/`);
      const contest = contestRes.data;

      const contestProblems = contest.problems || [];
      const problemIds = contestProblems.map((item) => item.problem_id);

      const [problemResponses, testcaseResponse] = await Promise.all([
        Promise.all(problemIds.map((pid) => API.get(`/problems/${pid}/`))),
        API.get("/testcases/"),
      ]);

      const problemDetails = problemResponses.map((res) => res.data);
      const allTestcases = Array.isArray(testcaseResponse.data)
        ? testcaseResponse.data
        : testcaseResponse.data.results || [];

      const solvedMap = {};

      const enrichedProblems = contestProblems
        .map((contestProblem) => {
          const matchingProblem = problemDetails.find(
            (problem) => Number(problem.id) === Number(contestProblem.problem_id)
          );
          if (!matchingProblem) return null;

          return normalizeProblemData(
            matchingProblem,
            contestProblem,
            allTestcases,
            solvedMap
          );
        })
        .filter(Boolean)
        .sort((a, b) => a.order - b.order);

      const defaultCodeStore = buildCodeStore(enrichedProblems);
      const defaultCustomInputs = {};
      enrichedProblems.forEach((problem) => {
        defaultCustomInputs[problem.id] = getDefaultInputForProblem(problem);
      });

      let savedDraft = null;

      try {
        const rawDraft = localStorage.getItem(contestDraftKey);
        savedDraft = rawDraft ? JSON.parse(rawDraft) : null;
      } catch (draftError) {
        console.error("Draft parse error:", draftError);
      }

      const validProblemIds = new Set(enrichedProblems.map((problem) => String(problem.id)));
      const mergedCodeStore = { ...defaultCodeStore };
      const mergedCustomInputs = { ...defaultCustomInputs };
      const restoredSubmittedProblemIds = {};

      if (savedDraft?.codeStore) {
        Object.entries(savedDraft.codeStore).forEach(([savedProblemId, savedLanguages]) => {
          if (!validProblemIds.has(String(savedProblemId))) return;

          mergedCodeStore[savedProblemId] = {
            ...defaultCodeStore[savedProblemId],
            ...savedLanguages,
          };
        });
      }

      if (savedDraft?.customInputMap) {
        Object.entries(savedDraft.customInputMap).forEach(([savedProblemId, savedInput]) => {
          if (!validProblemIds.has(String(savedProblemId))) return;
          mergedCustomInputs[savedProblemId] = savedInput;
        });
      }

      if (savedDraft?.submittedProblemIds) {
        Object.entries(savedDraft.submittedProblemIds).forEach(
          ([savedProblemId, isSubmitted]) => {
            if (!validProblemIds.has(String(savedProblemId))) return;
            restoredSubmittedProblemIds[savedProblemId] = Boolean(isSubmitted);
          }
        );
      }

      const initialSelectedIdFromDraft =
        savedDraft?.selectedProblemId &&
        enrichedProblems.some(
          (problem) => Number(problem.id) === Number(savedDraft.selectedProblemId)
        )
          ? Number(savedDraft.selectedProblemId)
          : null;

      const initialSelectedId =
        initialSelectedIdFromDraft ||
        (problemId && enrichedProblems.some((p) => p.id === Number(problemId))
          ? Number(problemId)
          : enrichedProblems[0]?.id || null);

      setContestInfo(contest);
      setProblemList(enrichedProblems);
      setCodeStore(mergedCodeStore);
      setCustomInputMap(mergedCustomInputs);
      setSelectedProblemId(initialSelectedId);
      setProblemTimeMap(savedDraft?.problemTimeMap || {});
      setSubmittedProblemIds(restoredSubmittedProblemIds);
      setLanguage(
        savedDraft?.language && starterTemplates[savedDraft.language]
          ? savedDraft.language
          : "python"
      );
      setLeftPanelWidth(clamp(Number(savedDraft?.leftPanelWidth) || 45, 28, 72));
      setBottomPanelHeight(clamp(Number(savedDraft?.bottomPanelHeight) || 240, 160, 500));

      if (contest.end_time) {
        const remainingSeconds = Math.max(
          0,
          Math.floor((new Date(contest.end_time).getTime() - Date.now()) / 1000)
        );
        setContestTime(remainingSeconds);
      }

      isDraftHydratedRef.current = true;
    } catch (err) {
      console.error("Contest editor load error:", err.response?.data || err.message);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to load contest editor."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeContest();
  }, [id]);

  useEffect(() => {
    if (!isDraftHydratedRef.current || loading || !problemList.length) return;

    const { codeStore: draftableCodeStore, customInputMap: draftableCustomInputMap } =
      getDraftableData();

    const payload = {
      codeStore: draftableCodeStore,
      customInputMap: draftableCustomInputMap,
      selectedProblemId,
      language,
      problemTimeMap,
      submittedProblemIds,
      leftPanelWidth,
      bottomPanelHeight,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(contestDraftKey, JSON.stringify(payload));
  }, [
    bottomPanelHeight,
    codeStore,
    contestDraftKey,
    customInputMap,
    getDraftableData,
    language,
    leftPanelWidth,
    loading,
    problemList,
    problemTimeMap,
    selectedProblemId,
    submittedProblemIds,
  ]);

  useEffect(() => {
    if (!contestInfo?.end_time) return;

    const timer = setInterval(() => {
      setContestTime((prev) => (prev > 0 ? prev - 1 : 0));
      setActiveTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [contestInfo?.end_time]);

  useEffect(() => {
    if (!selectedProblem?.id) return;
    problemStartRef.current = Date.now();
    setActiveTime(0);
  }, [selectedProblem?.id]);

  useEffect(() => {
    if (!selectedProblem) return;

    setCodeStore((prev) => ({
      ...prev,
      [selectedProblem.id]: {
        ...(prev[selectedProblem.id] || {}),
        [language]:
          prev[selectedProblem.id]?.[language] || starterTemplates[language],
      },
    }));
  }, [language, selectedProblem]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasUnsavedWork) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedWork]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!dragStateRef.current) return;

      if (dragStateRef.current.type === "horizontal" && mainGridRef.current) {
        const rect = mainGridRef.current.getBoundingClientRect();
        const nextWidth = clamp(
          ((event.clientX - rect.left) / rect.width) * 100,
          28,
          72
        );
        setLeftPanelWidth(nextWidth);
      }

      if (dragStateRef.current.type === "vertical" && rightPanelRef.current) {
        const rect = rightPanelRef.current.getBoundingClientRect();
        const maxHeight = Math.max(220, rect.height - 140);
        const nextHeight = clamp(rect.bottom - event.clientY, 160, maxHeight);
        setBottomPanelHeight(nextHeight);
      }
    };

    const handleMouseUp = () => {
      dragStateRef.current = null;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startHorizontalResize = () => {
    dragStateRef.current = { type: "horizontal" };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  const startVerticalResize = () => {
    dragStateRef.current = { type: "vertical" };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "row-resize";
  };

  const handleBackToProblems = () => {
    if (!hasUnsavedWork) {
      navigate(`/contest/${id}`);
      return;
    }

    const shouldLeave = window.confirm(
      "You have unsaved code. Do you want to leave without submitting?"
    );

    if (shouldLeave) {
      navigate(`/contest/${id}`);
    }
  };

  const handleProblemChange = (problem) => {
    if (!problem) return;

    if (selectedProblem?.id) {
      setProblemTimeMap((prev) => ({
        ...prev,
        [selectedProblem.id]: (prev[selectedProblem.id] || 0) + activeTime,
      }));
    }

    setSelectedProblemId(problem.id);
    setLeftTab("description");
    setBottomTab("testcase");
    setActiveTime(0);
  };

  const handleEditorChange = (value) => {
    if (!selectedProblem) return;

    setSubmittedProblemIds((prev) => ({
      ...prev,
      [selectedProblem.id]: false,
    }));

    setCodeStore((prev) => ({
      ...prev,
      [selectedProblem.id]: {
        ...(prev[selectedProblem.id] || {}),
        [language]: value || "",
      },
    }));
  };

  const handleCustomInputChange = (value) => {
    if (!selectedProblem) return;

    setSubmittedProblemIds((prev) => ({
      ...prev,
      [selectedProblem.id]: false,
    }));

    setCustomInputMap((prev) => ({
      ...prev,
      [selectedProblem.id]: value,
    }));
  };

  const handleRun = async () => {
    if (!selectedProblem) return;

    try {
      setRunLoading(true);
      setBottomTab("testcase");

      const res = await API.post("/run-code/", {
        problem_id: selectedProblem.id,
        source_code: currentCode,
        language_id: judge0LanguageMap[language],
        stdin: customInputMap[selectedProblem.id] || "",
      });

      setRunSummary((prev) => ({
        ...prev,
        [selectedProblem.id]: {
          passed: res.data.passed,
          total: res.data.total,
        },
      }));

      setRunResults((prev) => ({
        ...prev,
        [selectedProblem.id]: res.data.results || [],
      }));
    } catch (err) {
      console.error("RUN ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.detail || err.response?.data?.error || "Run failed");
    } finally {
      setRunLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProblem) return;

    try {
      const token = localStorage.getItem("access");

      if (!token) {
        alert("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const sourceCode =
        codeStore?.[selectedProblem.id]?.[language] || starterTemplates[language];

      if (!sourceCode.trim()) {
        alert("Please write code before submitting.");
        return;
      }

      setSubmitLoading(true);
      setBottomTab("result");

      const res = await API.post("/submit-code/", {
        problem_id: selectedProblem.id,
        contest_id: Number(id),
        source_code: sourceCode,
        language,
      });

      const submissionId = res.data.submission_id;
      const taskId = res.data.task_id;

      setSubmissionMeta((prev) => ({
        ...prev,
        [selectedProblem.id]: {
          submission_id: submissionId,
          task_id: taskId,
          status: "PENDING",
          runtime: 0,
          score: 0,
        },
      }));

      setSubmitResults((prev) => ({
        ...prev,
        [selectedProblem.id]: {
          problem_id: selectedProblem.id,
          title: selectedProblem.title,
          status: "PENDING",
          passed: false,
          score: 0,
          runtime: 0,
          passed_testcases: 0,
          total_testcases: selectedProblem.testcaseObjects?.length || 0,
        },
      }));

      setSubmittedProblemIds((prev) => ({
        ...prev,
        [selectedProblem.id]: true,
      }));

      clearProblemDraft(selectedProblem.id);
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      setSubmitLoading(false);

      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.clear();
        navigate("/login");
        return;
      }

      alert(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Code submit failed"
      );
    }
  };

  const handleFinishContest = async () => {
    try {
      const token = localStorage.getItem("access");

      if (!token) {
        alert("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const answers = problemList.map((problem) => ({
        problem_id: problem.id,
        source_code:
          codeStore?.[problem.id]?.[language] || starterTemplates[language],
        language_id: judge0LanguageMap[language],
        language,
      }));

      const hasEmptyCode = answers.some((item) => !item.source_code.trim());
      if (hasEmptyCode) {
        alert("Please write code for all questions before finishing contest.");
        return;
      }

      setSubmitLoading(true);

      const res = await API.post("/submit-contest/", {
        contest_id: id,
        answers,
      });

      const resultMap = {};
      (res.data.results || []).forEach((item) => {
        resultMap[item.problem_id] = item;
      });

      setSubmitResults(resultMap);
      setBottomTab("result");
      clearContestDraft();

      alert("Contest submitted successfully.");
      navigate(`/contest/${id}/leaderboard`);
    } catch (err) {
      console.error("Finish contest error:", err.response?.data || err.message);

      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.clear();
        navigate("/login");
        return;
      }

      alert(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Contest submit failed"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="contest-editor-layout d-flex align-items-center justify-content-center">
        <div className="text-center text-light">
          <Spinner animation="border" className="mb-3" />
          <div>Loading contest editor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contest-editor-layout d-flex align-items-center justify-content-center">
        <div className="text-center text-light">
          <h5 className="mb-2">Failed to load editor</h5>
          <p className="mb-3">{error}</p>
          <Button onClick={initializeContest}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!selectedProblem) {
    return (
      <div className="contest-editor-layout d-flex align-items-center justify-content-center">
        <div className="text-center text-light">No problem found for this contest.</div>
      </div>
    );
  }

  const selectedRunSummary = runSummary[selectedProblem.id];
  const selectedRunResults = runResults[selectedProblem.id] || [];
  const selectedSubmitResult = submitResults[selectedProblem.id];
  const selectedSubmissionMeta = submissionMeta[selectedProblem.id];
  const contestTitle = contestInfo?.name || "Contest";
  const contestStatus = contestInfo?.status || "Live";

  return (
    <div className="contest-editor-layout">
      <div className="editor-topbar d-flex align-items-center justify-content-between px-3 border-bottom bg-dark text-light">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            onClick={handleBackToProblems}
            className="btn btn-link text-decoration-none text-light small p-0"
          >
            ← Problem List
          </button>

          <div className="vr"></div>

          <span className="fw-semibold small">{contestTitle}</span>

          <span className="badge bg-success">{contestStatus}</span>

          <span className="badge bg-warning text-dark">{formatTime(contestTime)}</span>

          <span className="badge bg-secondary">
            This Problem: {formatTime(activeTime)}
          </span>
        </div>

        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant="outline-light"
            onClick={handleRun}
            disabled={runLoading}
          >
            {runLoading ? "Running..." : "Run"}
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleSubmit}
            disabled={submitLoading || !problemList.length}
          >
            {submitLoading ? "Submitting..." : "Submit Problem"}
          </Button>

          <Button
            size="sm"
            variant="success"
            onClick={handleFinishContest}
            disabled={submitLoading || !problemList.length}
          >
            Finish Contest
          </Button>
        </div>
      </div>

      <div
        className="editor-main-grid"
        ref={mainGridRef}
        style={{
          gridTemplateColumns: `${leftPanelWidth}% 8px calc(${100 - leftPanelWidth}% - 8px)`,
        }}
      >
        <aside className="editor-left-panel">
          <div className="editor-left-header">
            <div className="editor-problem-tabs-scroll">
              {problemList.map((problem, index) => (
                <button
                  key={problem.id}
                  className={`editor-problem-tab ${
                    selectedProblem.id === problem.id ? "active" : ""
                  }`}
                  onClick={() => handleProblemChange(problem)}
                >
                  {index + 1}. {problem.title}
                </button>
              ))}
            </div>
          </div>

          <div className="editor-problem-details">
            <div className="editor-problem-title-row">
              <h2 className="editor-problem-title">
                {selectedProblem.order}. {selectedProblem.title}
              </h2>
            </div>

            <div className="editor-problem-badges">
              <span
                className={`editor-pill ${getDifficultyClass(selectedProblem.difficulty)}`}
              >
                {selectedProblem.difficulty}
              </span>

              <span className={`editor-pill ${getStatusClass(selectedProblem.status)}`}>
                {selectedProblem.status}
              </span>

              <span className="editor-pill editor-points-pill">
                {selectedProblem.points} Points
              </span>

              {selectedProblem.tags.map((tag, index) => (
                <span key={index} className="editor-pill editor-tag-pill">
                  {tag}
                </span>
              ))}
            </div>

            <div className="editor-left-tabs">
              <button
                className={`editor-left-tab-btn ${leftTab === "description" ? "active" : ""}`}
                onClick={() => setLeftTab("description")}
              >
                Description
              </button>

              <button
                className={`editor-left-tab-btn ${leftTab === "examples" ? "active" : ""}`}
                onClick={() => setLeftTab("examples")}
              >
                Examples
              </button>

              <button
                className={`editor-left-tab-btn ${leftTab === "constraints" ? "active" : ""}`}
                onClick={() => setLeftTab("constraints")}
              >
                Constraints
              </button>
            </div>

            <div className="editor-left-content">
              {leftTab === "description" && (
                <div className="editor-content-section">
                  {String(selectedProblem.description || "")
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
                  {selectedProblem.examples.length ? (
                    selectedProblem.examples.map((example, index) => (
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
                  {selectedProblem.constraints.length ? (
                    <ul className="editor-constraints-list">
                      {selectedProblem.constraints.map((item, index) => (
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
        </aside>

        <div
          role="separator"
          aria-orientation="vertical"
          className="editor-resizer editor-resizer-vertical"
          onMouseDown={startHorizontalResize}
        />

        <section
          className="editor-right-panel"
          ref={rightPanelRef}
          style={{
            display: "grid",
            gridTemplateRows: `48px minmax(0, 1fr) 8px ${bottomPanelHeight}px`,
          }}
        >
          <div className="editor-code-header">
            <div className="editor-code-header-left">
              <span className="editor-code-title">Code</span>
            </div>

            <div className="editor-code-header-right">
              <Form.Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="editor-language-select"
              >
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
              </Form.Select>
            </div>
          </div>

          <div className="editor-monaco-wrap">
            <Editor
              height="100%"
              language={editorLanguageMap[language]}
              value={currentCode}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                lineNumbers: "on",
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on",
                padding: { top: 16 },
              }}
            />
          </div>

          <div
            role="separator"
            aria-orientation="horizontal"
            className="editor-resizer editor-resizer-horizontal"
            onMouseDown={startVerticalResize}
          />

          <div className="editor-bottom-panel">
            <div className="editor-bottom-tabs">
              <button
                className={`editor-bottom-tab ${bottomTab === "testcase" ? "active" : ""}`}
                onClick={() => setBottomTab("testcase")}
              >
                Testcase
              </button>

              <button
                className={`editor-bottom-tab ${bottomTab === "result" ? "active" : ""}`}
                onClick={() => setBottomTab("result")}
              >
                Test Result
              </button>
            </div>

            <div className="editor-bottom-content">
              {bottomTab === "testcase" && (
                <div className="editor-testcase-section">
                  <label className="editor-input-label">Custom Input</label>

                  <textarea
                    className="editor-custom-input"
                    value={customInputMap[selectedProblem.id] || ""}
                    onChange={(e) => handleCustomInputChange(e.target.value)}
                    placeholder={selectedProblem.testcases || "Enter custom input"}
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
                          <div className={item.passed ? "text-success" : "text-danger"}>
                            Test Case {item.testcase}: {item.passed ? "Passed" : "Failed"}
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

                  {selectedSubmissionMeta?.status === "PENDING" && (
                    <div className="text-warning mb-2">
                      Submission is in queue. Waiting for judge result...
                    </div>
                  )}

                  <pre className="editor-output-pre">
                    {selectedSubmitResult
                      ? `Problem: ${selectedSubmitResult.title || selectedProblem.title}
Verdict: ${getVerdictLabel(selectedSubmitResult.status)}
Score: ${selectedSubmitResult.score ?? 0}
Runtime: ${selectedSubmitResult.runtime ?? 0}
Passed Testcases: ${selectedSubmitResult.passed_testcases ?? 0}/${selectedSubmitResult.total_testcases ?? 0}

Submission ID: ${selectedSubmissionMeta?.submission_id || "N/A"}
Task Status: ${selectedSubmissionMeta?.status || "N/A"}`
                      : "Submission result will appear here."}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ContestEditorPage;