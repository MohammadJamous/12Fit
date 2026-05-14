import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Generate AI workout plan
 * @param {Object} data
 */
export const generateWorkout = async (data) => {
  try {
    const response = await api.post("/workouts/generate", data);

    return response.data;
  } catch (error) {
    console.error(
      "Workout Service Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};
