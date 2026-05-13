import axios from "axios";
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});
/**

 * @param {Object} data - تحتوي على (age, weight, height, goal, activity)
 */
export const generateWorkout = async (data) => {
  try {
    const response = await api.post("/workouts/generate", data);
    return response.data; 
  } catch (error) {
    console.error("Workout Service Error:", error.response?.data || error.message);
    throw error;
  }
};
