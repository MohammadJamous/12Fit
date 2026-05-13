import api from "../utils/api";

export const getProducts = (search = "") => {
	return api.get(`/products?search=${search}`);
};

export const createProduct = (productData) => {
	return api.post("/products", productData);
};

export const updateProduct = (id, productData) => {
	return api.put(`/products/${id}`, productData);
};

export const deleteProduct = (id) => {
	return api.delete(`/products/${id}`);
};