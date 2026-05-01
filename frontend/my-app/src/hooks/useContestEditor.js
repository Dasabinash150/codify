import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { judge0LanguageMap, starterTemplates } from "../constants/editorConstants";
import {
  clamp,
  parseConstraints,
  parseTags,
  getErrorMessage,
} from "../utils/editorUtils";

export default function useContestEditor(id, problemId) {

  const navigate = useNavigate();
  const contestDraftKey = useMemo(() => `contest_draft_${id}`, [id]);

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
  const [submissionHistory, setSubmissionHistory] = useState([]);

  const [codeStore, setCodeStore] = useState({});
  const [loading, setLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  const [contestTime, setContestTime] = useState(0);
  const [contestEnded, setContestEnded] = useState(false);

  const [activeTime, setActiveTime] = useState(0);
  const [problemTimeMap, setProblemTimeMap] = useState({});
  const [submittedProblemIds, setSubmittedProblemIds] = useState({});

  const [leftPanelWidth, setLeftPanelWidth] = useState(45);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(260);

  const autoSubmitRef = useRef(false);

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

  const selectedRunSummary = selectedProblem ? runSummary[selectedProblem.id] : null;
  const selectedRunResults = selectedProblem ? runResults[selectedProblem.id] || [] : [];
  const selectedSubmitResult = selectedProblem
    ? submitResults[selectedProblem.id]
    : null;
  const selectedSubmissionMeta = selectedProblem
    ? submissionMeta[selectedProblem.id]
    : null;

  const getDefaultInputForProblem = useCallback((problem) => {
    return problem?.testcases || "";
  }, []);

  const buildCodeStore = useCallback((problems) => {
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

  const normalizeProblemData = useCallback((problem, contestProblem, allTestcases, solvedMap) => {
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
      status: submittedProblemIds[problem.id] ? "Solved" : "Unsolved",
      examples,
      testcases: firstSample?.input || "",
      testcaseObjects: problemTestcases,
    };
  }, []);

  const loadSubmissionHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);

      const res = await API.get("/submissions/");

      console.log("RAW SUBMISSIONS API:", res.data);

      const items = Array.isArray(res.data)
        ? res.data
        : res.data?.results || [];

      const filtered = items
        .filter((item) => {
          const itemContestId =
            item.contest_id ||
            item.contest?.id ||
            item.contest ||
            "";

          const itemProblemId =
            item.problem_id ||
            item.problem?.id ||
            item.problem ||
            "";

          return (
            String(itemContestId) === String(id) &&
            String(itemProblemId) === String(selectedProblem?.id)
          );
        })
        .sort(
          (a, b) =>
            new Date(b.submitted_at || b.created_at || 0) -
            new Date(a.submitted_at || a.created_at || 0)
        );

      console.log("FILTERED HISTORY:", filtered);

      setSubmissionHistory(filtered);
    } catch (err) {
      console.error(
        "Submission history load error:",
        err?.response?.data || err.message
      );

      setSubmissionHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [id, selectedProblem]);

  // const pollSubmissionHistory = useCallback(async (retries = 8, delay = 2000) => {
  //   for (let i = 0; i < retries; i++) {
  //     await loadSubmissionHistory();
  //     await new Promise((resolve) => setTimeout(resolve, delay));
  //   }
  // }, [loadSubmissionHistory]);

  const initializeContest = useCallback(async () => {
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
      setBottomPanelHeight(clamp(Number(savedDraft?.bottomPanelHeight) || 260, 180, 520));

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
      setError(getErrorMessage(err, "Failed to load contest editor."));
    } finally {
      setLoading(false);
    }
  }, [
    id,
    problemId,
    contestDraftKey,
    normalizeProblemData,
    buildCodeStore,
    getDefaultInputForProblem,
  ]);

  useEffect(() => {
    initializeContest();
  }, [initializeContest]);

  useEffect(() => {
    if (selectedProblem?.id) {
      loadSubmissionHistory();
    }
  }, [selectedProblem?.id, loadSubmissionHistory]);

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
  //  Timer
  useEffect(() => {
    if (!contestInfo?.end_time) return;

    const timer = setInterval(() => {
      setContestTime((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          finishContest(true);   // 🔥 call directly
          return 0;
        }
        return prev > 0 ? prev - 1 : 0;
      });

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

  const handleBackToProblems = useCallback(() => {
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
  }, [hasUnsavedWork, id, navigate]);

  const handleProblemChange = useCallback((problem) => {
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
  }, [activeTime, selectedProblem]);

  const handleEditorChange = useCallback((value) => {
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
  }, [language, selectedProblem]);

  const handleCustomInputChange = useCallback((value) => {
    if (!selectedProblem) return;

    setSubmittedProblemIds((prev) => ({
      ...prev,
      [selectedProblem.id]: false,
    }));

    setCustomInputMap((prev) => ({
      ...prev,
      [selectedProblem.id]: value,
    }));
  }, [selectedProblem]);

  const handleRun = useCallback(async () => {
    if (!selectedProblem) return;

    try {
      setRunLoading(true);
      setBottomTab("testcase");

      const res = await API.post("/run-code/", {
        problem_id: selectedProblem.id,
        source_code: currentCode || "",
        language_id: judge0LanguageMap[language],
        stdin: customInputMap[selectedProblem.id] || "",
      });

      setRunSummary((prev) => ({
        ...prev,
        [selectedProblem.id]: {
          passed: res.data.passed || 0,
          total: res.data.total || 0,
        },
      }));

      setRunResults((prev) => ({
        ...prev,
        [selectedProblem.id]: res.data.results || [],
      }));
    } catch (err) {
      console.error("RUN ERROR:", err.response?.data || err.message);
      alert(getErrorMessage(err, "Run failed"));
    } finally {
      setRunLoading(false);
    }
  }, [currentCode, customInputMap, language, selectedProblem]);

  const handleSubmit = useCallback(async () => {
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
        language_id: judge0LanguageMap[language],
        language,
      });

      const data = res.data;
      setSubmitResults((prev) => ({
        ...prev,
        [selectedProblem.id]: {
          problem_id: selectedProblem.id,
          title: selectedProblem.title,
          status: data.status,
          passed: data.status === "AC",
          score: data.score,
          runtime: data.runtime,
          passed_testcases: data.passed,
          total_testcases: data.total,
        },
      }));


      if (data.status === "AC") {
        setSubmittedProblemIds((prev) => ({
          ...prev,
          [selectedProblem.id]: true,
        }));
      }

      clearProblemDraft(selectedProblem.id);
      //await pollSubmissionHistory();
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);

      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.clear();
        navigate("/login");
        return;
      }

      alert(getErrorMessage(err, "Code submit failed"));
    } finally {
      setSubmitLoading(false);
    }
  }, [codeStore, language, selectedProblem, id, clearProblemDraft, navigate]);
  // ==================== Finish Contest =========================================

  const finishContest = useCallback((isAuto = false) => {
    if (autoSubmitRef.current) return;   // 🔒 prevent duplicates
    autoSubmitRef.current = true;

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

      if (!isAuto) {
        const hasEmptyCode = answers.some(
          (item) => !item.source_code || !item.source_code.trim()
        );

        if (hasEmptyCode) {
          alert("Please write code for all questions before finishing contest.");
          autoSubmitRef.current = false; // allow retry
          return;
        }
      }

      setContestEnded(true);

      API.post("/submit-contest/", {
        contest_id: id,
        answers,
      }).catch((err) => {
        if (err.response?.status !== 403) {
          console.error(err);
        }
      });

      clearContestDraft();

      alert(
        isAuto
          ? "⏱ Time over! Auto submitted."
          : "Contest submitted successfully."
      );

      navigate(`/contest/${id}/leaderboard`);

    } catch (err) {
      console.error(err);
    }
  }, [problemList, codeStore, language, id, clearContestDraft, navigate]);

  const handleFinishContest = () => {
    finishContest(false);
  };



  return {
    loading,
    error,
    contestInfo,
    contestTitle: contestInfo?.name || "Contest",
    contestStatus: contestInfo?.status || "Live",
    problemList,
    selectedProblem,
    submittedProblemIds,

    language,
    setLanguage,
    leftTab,
    setLeftTab,
    bottomTab,
    setBottomTab,
    currentCode,
    customInputMap,
    handleEditorChange,
    handleCustomInputChange,
    handleProblemChange,
    handleRun,
    handleSubmit,
    handleFinishContest,
    loadSubmissionHistory,
    runLoading,
    submitLoading,
    historyLoading,
    selectedRunSummary,
    selectedRunResults,
    selectedSubmitResult,
    selectedSubmissionMeta,
    submissionHistory,
    contestTime,
    activeTime,
    hasUnsavedWork,

    contestEnded,

    handleBackToProblems,
    leftPanelWidth,
    setLeftPanelWidth,
    bottomPanelHeight,
    setBottomPanelHeight,

  };
}