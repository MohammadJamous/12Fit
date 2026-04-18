import api from "../utils/api";

export const registerUser = (userData) => api.post("/auth/register", userData);

export const loginUser = (userData) => api.post("/auth/login", userData);