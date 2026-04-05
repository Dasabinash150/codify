export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const parseTags = (tagsValue) => {
  if (!tagsValue) return [];
  if (Array.isArray(tagsValue)) return tagsValue;

  return String(tagsValue)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

export const parseConstraints = (constraintsValue) => {
  if (!constraintsValue) return [];

  return String(constraintsValue)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const getDifficultyClass = (difficulty) => {
  const value = String(difficulty || "").toLowerCase();
  if (value === "easy") return "editor-badge-easy";
  if (value === "medium") return "editor-badge-medium";
  if (value === "hard") return "editor-badge-hard";
  return "editor-badge-default";
};

export const getStatusClass = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === "solved") return "editor-status-solved";
  if (value === "attempted") return "editor-status-attempted";
  return "editor-status-unsolved";
};

export const getVerdictLabel = (status) => {
  const value = String(status || "").toUpperCase();

  if (value === "AC" || value === "ACCEPTED") return "Accepted";
  if (value === "WA") return "Wrong Answer";
  if (value === "TLE") return "Time Limit Exceeded";
  if (value === "RE") return "Runtime Error";
  if (value === "CE") return "Compilation Error";
  if (value === "PENDING") return "Pending";

  return value || "Unknown";
};

export const formatDateTime = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString("en-IN");
};

export const formatTime = (sec) => {
  const safe = Math.max(0, Number(sec) || 0);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
    s
  ).padStart(2, "0")}`;
};

export const getErrorMessage = (err, fallback = "Something went wrong") => {
  const data = err?.response?.data;
  if (!data) return fallback;

  if (typeof data === "string") return data;
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.error === "string") return data.error;
  if (typeof data?.message === "string") return data.message;

  const firstKey = Object.keys(data)[0];
  const firstValue = data[firstKey];

  if (Array.isArray(firstValue)) return firstValue[0];
  if (typeof firstValue === "string") return firstValue;

  return fallback;
};