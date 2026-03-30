import API from "./api";

<<<<<<< HEAD
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const getContests = () => API.get("/api/contests/");
=======
export const getContests = () => API.get("/contests/");

export const getContestById = (id) =>
  API.get(`/contests/${id}/`);

export const joinContest = (id) =>
  API.post(`/contests/${id}/join/`);

export const getLeaderboard = (id) =>
  API.get(`/leaderboard/${id}/`);
>>>>>>> dev
