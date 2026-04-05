// src/services/api.js
import axios from "axios";

const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// Normalize:
// http://127.0.0.1:8000/api/
// http://127.0.0.1:8000/api
// http://127.0.0.1:8000
// all become base ending with /api
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, "").replace(/\/api$/, "");

const API = axios.create({
  baseURL: `${normalizedBaseUrl}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem("access");

    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const WS_BASE_URL = (
  import.meta.env.VITE_WS_BASE_URL || "ws://127.0.0.1:8000"
).replace(/\/+$/, "");

export default API;