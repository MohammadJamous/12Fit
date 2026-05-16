import api from "../utils/api";
// Build the authorization header for authenticated diet API requests.

const authConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
// Generate a standard diet plan from the user's input data.

export const generateDiet = async (data, token) => {
  const response = await api.post("/diet", data, authConfig(token));
  return response.data;
};
// Retrieve all saved diet plans for the authenticated user.

export const getDietPlans = async (token) => {
  const response = await api.get("/diet", authConfig(token));
  return response.data;
};
// Save a generated or custom diet plan to the backend.

export const saveDietPlan = async (data, token) => {
  const response = await api.post("/diet/save", data, authConfig(token));
  return response.data;
};
// Generate a personalized diet plan using the AI-powered backend endpoint.

export const generateDietAI = async (data, token) => {
  const response = await api.post("/diet/ai-generate", data, authConfig(token));
  return response.data;
};
// Send a user instruction to revise the current AI-generated diet plan.

export const reviseDietAI = async (data, token) => {
  const response = await api.post("/diet/ai-revise", data, authConfig(token));
  return response.data;
};
