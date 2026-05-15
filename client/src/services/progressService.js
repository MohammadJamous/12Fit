import api from "../api/api";

export const getProgress = () => api.get("/progress");

export const addProgress = (progressData) => api.post("/progress", progressData);