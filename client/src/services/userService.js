import api from "../api/api";

export const getUsersWithPlans = () => api.get("/users/with-plans");

export const deleteUser = (userId) => api.delete(`/users/${userId}`);

export const getRegisteredUsersCount = () => api.get("/users/count");

export const getOnlineUsersCount = () => api.get("/users/online-count");

export const updateUserRole = (userId, role) =>
  api.put(`/users/${userId}/role`, { role });

export const checkApiStatus = () => api.get("/users/api-status");

export const checkDbStatus = () => api.get("/users/db-status");

export const getUptime = () => api.get("/users/uptime");

export const getDbPing = () => api.get("/users/db-ping");