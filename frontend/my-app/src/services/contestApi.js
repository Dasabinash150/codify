import API from "./api";

export const getContests = () => API.get("/contests/");

export const getContestById = (id) =>
  API.get(`/contests/${id}/`);

export const joinContest = (id) =>
  API.post(`/contests/${id}/join/`);

export const getLeaderboard = (id) =>
  API.get(`/leaderboard/${id}/`);