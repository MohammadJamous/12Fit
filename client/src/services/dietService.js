import api from "../utils/api";

export const getDietPlan = (goal) => api.post("/diet", { goal });