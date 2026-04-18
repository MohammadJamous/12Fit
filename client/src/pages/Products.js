import { useEffect, useState, useCallback } from "react";
import { getProducts, createProduct } from "../services/productService";

function Products() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      const res = await getProducts(token);
      setProducts(res.data);
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    try {
      await createProduct({ name, price, category }, token);
      setName("");
      setPrice("");
      setCategory("");
      loadProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Products</h2>

      {user?.role === "admin" && (
        <div className="card shadow-sm border-0 p-4 mb-4">
          <h4 className="mb-3">Add Product (Admin Only)</h4>

          <form onSubmit={handleCreateProduct}>
            <div className="mb-3">
              <label className="form-label">Product Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Price</label>
              <input
                type="number"
                className="form-control"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <button className="btn btn-dark">Add Product</button>
          </form>
        </div>
      )}

      <div className="row g-4">
        {products.map((product) => (
          <div className="col-md-4" key={product.id}>
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h5>{product.name}</h5>
                <p className="mb-1">Category: {product.category}</p>
                <p className="fw-bold">${product.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;