import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProblemById,
  getProblemTestCases,
  runProblemCode,
  submitProblemCode,
} from "../services/problemApi";
import { judge0LanguageMap, starterTemplates } from "../constants/editorConstants";
import { clamp, getErrorMessage } from "../utils/editorUtils";

export default function useProblemEditor(id) {
  const navigate = useNavigate();
  const draftKey = useMemo(() => `problem_editor_draft_${id}`, [id]);

  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [language, setLanguage] = useState("python");
  const [leftTab, setLeftTab] = useState("description");
  const [bottomTab, setBottomTab] = useState("testcase");

  const [codeStore, setCodeStore] = useState({
    javascript: starterTemplates.javascript,
    python: starterTemplates.python,
    cpp: starterTemplates.cpp,
    java: starterTemplates.java,
  });

  const [customInput, setCustomInput] = useState("");
  const [runSummary, setRunSummary] = useState(null);
  const [runResults, setRunResults] = useState([]);
  const [submitResult, setSubmitResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [leftPanelWidth, setLeftPanelWidth] = useState(45);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(240);

  const currentCode = codeStore[language] || starterTemplates[language];

  const examples = useMemo(() => {
    return testCases
      .filter((tc) => tc.is_sample || tc.sample || tc.isSample)
      .map((tc, index) => ({
        input: tc.input,
        output: tc.expected_output,
        explanation: `Sample testcase ${index + 1}`,
      }));
  }, [testCases]);

  const fallbackExamples = useMemo(() => {
    if (examples.length) return examples;

    return testCases.slice(0, 2).map((tc, index) => ({
      input: tc.input,
      output: tc.expected_output,
      explanation: `Sample testcase ${index + 1}`,
    }));
  }, [examples, testCases]);

  const defaultInput = useMemo(() => {
    return testCases[0]?.input || "";
  }, [testCases]);

  const hasUnsavedWork = useMemo(() => {
    const hasCodeChange = Object.entries(starterTemplates).some(
      ([lang, template]) => (codeStore[lang] ?? template) !== template
    );
    const hasCustomInput = customInput.trim() !== "";
    return !isSubmitted && (hasCodeChange || hasCustomInput);
  }, [codeStore, customInput, isSubmitted]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftKey);
  }, [draftKey]);

  const loadProblem = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [problemRes, testCaseRes] = await Promise.all([
        getProblemById(id),
        getProblemTestCases(id),
      ]);

      const loadedProblem = problemRes?.data || null;
      const loadedTestCases = Array.isArray(testCaseRes?.data)
        ? testCaseRes.data
        : testCaseRes?.data?.results || [];

      setProblem(loadedProblem);
      setTestCases(loadedTestCases);

      let savedDraft = null;
      try {
        const raw = localStorage.getItem(draftKey);
        savedDraft = raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.error("Draft parse error:", e);
      }

      if (savedDraft?.codeStore && typeof savedDraft.codeStore === "object") {
        setCodeStore((prev) => ({
          ...prev,
          ...savedDraft.codeStore,
        }));
      }

      if (typeof savedDraft?.customInput === "string") {
        setCustomInput(savedDraft.customInput);
      } else {
        setCustomInput(loadedTestCases[0]?.input || "");
      }

      if (
        savedDraft?.language &&
        Object.prototype.hasOwnProperty.call(starterTemplates, savedDraft.language)
      ) {
        setLanguage(savedDraft.language);
      }

      setLeftPanelWidth(clamp(Number(savedDraft?.leftPanelWidth) || 45, 28, 72));
      setBottomPanelHeight(clamp(Number(savedDraft?.bottomPanelHeight) || 240, 160, 500));
      setIsSubmitted(Boolean(savedDraft?.isSubmitted));
    } catch (err) {
      console.error("Problem editor load error:", err);
      setError(getErrorMessage(err, "Failed to load problem."));
    } finally {
      setLoading(false);
    }
  }, [id, draftKey]);

  useEffect(() => {
    loadProblem();
  }, [loadProblem]);

  useEffect(() => {
    if (loading) return;

    const payload = {
      codeStore,
      customInput,
      language,
      leftPanelWidth,
      bottomPanelHeight,
      isSubmitted,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(draftKey, JSON.stringify(payload));
  }, [
    bottomPanelHeight,
    codeStore,
    customInput,
    draftKey,
    isSubmitted,
    language,
    leftPanelWidth,
    loading,
  ]);

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
      navigate("/problems");
      return;
    }

    const shouldLeave = window.confirm(
      "You have unsaved code. Do you want to leave without submitting?"
    );

    if (shouldLeave) {
      navigate("/problems");
    }
  }, [hasUnsavedWork, navigate]);

  const handleEditorChange = useCallback((value) => {
    setIsSubmitted(false);
    setCodeStore((prev) => ({
      ...prev,
      [language]: value || "",
    }));
  }, [language]);

  const handleCustomInputChange = useCallback((value) => {
    setIsSubmitted(false);
    setCustomInput(value);
  }, []);

  const handleRun = useCallback(async () => {
    try {
      setRunLoading(true);
      setBottomTab("testcase");

      const res = await runProblemCode({
        source_code: currentCode,
        language_id: judge0LanguageMap[language],
        stdin: customInput || defaultInput || "",
        problem_id: Number(id),
      });

      const data = res?.data || {};

      if (Array.isArray(data.results)) {
        setRunSummary({
          passed: data.passed ?? 0,
          total: data.total ?? data.results.length,
        });
        setRunResults(data.results);
      } else {
        const stdout = data.stdout || "";
        const stderr = data.stderr || "";
        const compileOutput = data.compile_output || "";

        const finalOutput =
          stdout.trim() ||
          stderr.trim() ||
          compileOutput.trim() ||
          "";

        setRunSummary(null);

        setRunResults([
          {
            testcase: 1,
            passed: !!stdout && !stderr && !compileOutput,
            expected_output: "Check testcase output",
            actual_output: finalOutput || "No output received",
          },
        ]);
      }
    } catch (err) {
      console.error("RUN ERROR:", err);
      alert(getErrorMessage(err, "Run failed"));
    } finally {
      setRunLoading(false);
    }
  }, [currentCode, language, customInput, defaultInput, id]);

  const handleSubmit = useCallback(async () => {
    try {
      setSubmitLoading(true);
      setBottomTab("result");

      const res = await submitProblemCode({
        problem_id: Number(id),
        source_code: currentCode,
        language_id: judge0LanguageMap[language],
      });

      const data = res?.data || {};

      setSubmitResult({
        title: problem?.title || "Problem",
        status:
          data.status ||
          (data.passed === data.total && data.total > 0 ? "AC" : "WA"),
        score: data.score ?? 0,
        runtime: data.runtime ?? 0,
        passed_testcases: data.passed ?? 0,
        total_testcases: data.total ?? testCases.length,
        raw: data,
      });

      setIsSubmitted(true);
      clearDraft();
    } catch (err) {
      console.error("Submit error:", err);

      if (err?.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/login");
        return;
      }

      alert(getErrorMessage(err, "Submit failed"));
    } finally {
      setSubmitLoading(false);
    }
  }, [id, currentCode, language, problem, testCases.length, clearDraft, navigate]);

  return {
    loading,
    error,
    problem,
    language,
    setLanguage,
    leftTab,
    setLeftTab,
    bottomTab,
    setBottomTab,
    currentCode,
    customInput,
    handleEditorChange,
    handleCustomInputChange,
    handleBackToProblems,
    handleRun,
    handleSubmit,
    runLoading,
    submitLoading,
    runSummary,
    runResults,
    submitResult,
    defaultInput,
    fallbackExamples,
    leftPanelWidth,
    setLeftPanelWidth,
    bottomPanelHeight,
    setBottomPanelHeight,
    reloadProblem: loadProblem,
  };
}