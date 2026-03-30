import api from "./api";

export const getContests = () => api.get("/contests/");
export const getContestById = (id) => api.get(`/contests/${id}/`);
export const joinContest = (id) => api.post(`/contests/${id}/join/`);