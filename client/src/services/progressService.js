import api from "../utils/api";

export const getProgress = () => api.get("/progress");

export const addProgress = (progressData) => api.post("/progress", progressData);