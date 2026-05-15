import api from "../api/api";

const authConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const generateDiet = async (data, token) => {
  const response = await api.post("/diet", data, authConfig(token));
  return response.data;
};

export const getDietPlans = async (token) => {
  const response = await api.get("/diet", authConfig(token));
  return response.data;
};

export const saveDietPlan = async (data, token) => {
  const response = await api.post("/diet/save", data, authConfig(token));
  return response.data;
};

export const generateDietAI = async (data, token) => {
  const response = await api.post("/diet/ai-generate", data, authConfig(token));
  return response.data;
};

export const reviseDietAI = async (data, token) => {
  const response = await api.post("/diet/ai-revise", data, authConfig(token));
  return response.data;
};