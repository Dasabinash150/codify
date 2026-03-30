import API from "./api";

export const getProblems = () => API.get("/problems/");
export const getProblemById = (id) => API.get(`/problems/${id}/`);
export const getProblemTestCases = (id) =>
  API.get(`/testcases/?problem=${id}`);

export const runProblemCode = (payload) =>
  API.post("/run-code/", payload);

export const submitProblemCode = (payload) =>
  API.post("/submit-code/", payload);