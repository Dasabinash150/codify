// src/services/api.js
import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// normalize:
// http://127.0.0.1:8000/api/
// http://127.0.0.1:8000/api
// http://127.0.0.1:8000
// all become clean base ending with /api
const normalizedBaseUrl = rawBaseUrl
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const API = axios.create({
  baseURL: `${normalizedBaseUrl}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const WS_BASE_URL =
  (import.meta.env.VITE_WS_BASE_URL || "ws://127.0.0.1:8000").replace(/\/+$/, "");

export default API;