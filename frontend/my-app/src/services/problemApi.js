import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getProblemById = (id) => api.get(`/problems/${id}/`);
export const getProblemTestCases = (id) => api.get(`/testcases/?problem=${id}`);

export const runProblemCode = (payload) => api.post(`/run-code/`, payload);

export const submitProblemCode = (payload) => api.post(`/submit-code/`, payload);

export default api;