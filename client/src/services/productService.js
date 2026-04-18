import api from "../utils/api";

export const getProducts = () => api.get("/products");

export const createProduct = (productData) => api.post("/products", productData);