import api from "../utils/api";

export const createOrder = (data) => {
  return api.post("/orders", data);
};

export const getOrders = () => {
  return api.get("/orders");
};

export const getOrderById = (id) => {
  return api.get(`/orders/${id}`);
};

export const updateOrderStatus = (id, status) => {
  return api.put(`/orders/${id}/status`, { status });
};

export const deleteOrder = (id) => {
  return api.delete(`/orders/${id}`);
};
