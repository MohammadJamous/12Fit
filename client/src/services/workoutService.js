import api from "../utils/api";

export const getWorkouts = () => api.get("/workouts");

export const createWorkout = (workoutData) => api.post("/workouts", workoutData);