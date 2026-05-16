import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  getUsersWithPlans,
  deleteUser,
  getRegisteredUsersCount,
  getOnlineUsersCount,
  checkApiStatus,
  updateUserRole,
  checkDbStatus,
  getUptime,
  getDbPing,
} from "../services/userService";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../services/productService";
import { getOrders , deleteOrder} from "../services/orderService";


function Dashboard() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [registeredCount, setRegisteredCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [apiStatus, setApiStatus] = useState(null);
  const [apiStatusType, setApiStatusType] = useState("");
  const [dbStatus, setDbStatus] = useState(null);
  const [dbStatusType, setDbStatusType] = useState("");
  const [responseTime, setResponseTime] = useState(null);
  const [responseTimeType, setResponseTimeType] = useState("");
  const [roleUpdateTarget, setRoleUpdateTarget] = useState(null);
  const [roleUpdateStatus, setRoleUpdateStatus] = useState(null);
  const [roleUpdating, setRoleUpdating] = useState(false);
  const [orderNotification, setOrderNotification] = useState(null);

  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    category: "",
    shortDesc: "",
    description: "",
    usageTips: "",
    benefits: "",
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState("");
  const [productSaving, setProductSaving] = useState(false);
  const [productStatus, setProductStatus] = useState(null);

  const socketRef = useRef(null);
  const productFileRef = useRef(null);

  const cardsPerPage = 3;

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUser = storedUser;
  const username = storedUser.name || "Admin";

  const loadUsers = useCallback(async () => {
    try {
      const res = await getUsersWithPlans();
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const loadCounts = useCallback(async () => {
    try {
      const res = await getRegisteredUsersCount();
      setRegisteredCount(res.data.total || 0);
    } catch (error) {
      console.log(error);
    }

    try {
      const res = await getOnlineUsersCount();
      setOnlineCount(res.data.online || 0);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const res = await getProducts();
      setProducts(res.data || []);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const res = await getOrders();
      setOrders(res.data || []);
    } catch (error) {
      console.log(error);
    }
  }, []);

const handleDeliverOrder = async (orderId, customerName) => {
  try {
    await deleteOrder(orderId);

    setOrders((prev) => prev.filter((o) => o._id !== orderId));

    setOrderNotification(
      `تم تسليم الطلب بنجاح للعميل ${customerName || ""}`.trim()
    );
  } catch (error) {
    console.log(error);
  }
};

  useEffect(() => {
    loadUsers();
    loadCounts();
    loadProducts();
    loadOrders();
  }, [loadUsers, loadCounts, loadProducts, loadOrders]);

  useEffect(() => {
    socketRef.current = io(
      process.env.REACT_APP_API_URL || "http://localhost:8080"
    );

    if (storedUser?.id) {
      socketRef.current.emit("user-online", storedUser.id);
    }

    socketRef.current.on("online-users-count", (count) => {
      setOnlineCount(count);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [storedUser?.id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    return () => {
      if (productImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(productImagePreview);
      }
    };
  }, [productImagePreview]);

  useEffect(() => {
    if (!orderNotification) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setOrderNotification(null);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [orderNotification]);

  const handleCheckApiStatus = async () => {
    setApiStatus("Checking API status...");
    setApiStatusType("info");

    try {
      await checkApiStatus();
      setApiStatus("API is working: connection successful.");
      setApiStatusType("success");
    } catch (error) {
      console.error(error);
      setApiStatus("API is not working: unable to connect.");
      setApiStatusType("danger");
    }
  };

  const handleCheckDbStatus = async () => {
    setDbStatus("Checking database status...");
    setDbStatusType("info");

    try {
      const res = await checkDbStatus();
      setDbStatus(res.data.status);
      setDbStatusType("success");
    } catch (error) {
      console.error(error);
      setDbStatus("Database is not working: connection failed.");
      setDbStatusType("danger");
    }
  };

  const handleTestResponseTime = async () => {
    setResponseTime("Testing response time...");
    setResponseTimeType("info");

    const startTime = Date.now();

    try {
      await checkApiStatus();
      const apiResponseTime = Date.now() - startTime;

      const uptimeRes = await getUptime();
      const uptime = uptimeRes.data.uptime;

      const dbPingRes = await getDbPing();
      const dbPingTime = dbPingRes.data.dbPingTime;

      setResponseTime(
        `1) Response Time: ${apiResponseTime} ms\n2) Uptime: ${uptime} seconds\n3) DB Ping Time: ${dbPingTime} ms`
      );
      setResponseTimeType("success");
    } catch (error) {
      const apiResponseTime = Date.now() - startTime;
      setResponseTime(
        `Response failed after ${apiResponseTime} ms. Could not fetch uptime or DB ping.`
      );
      setResponseTimeType("danger");
    }
  };

  const handleShowRoleOptions = (userId) => {
    setRoleUpdateStatus(null);
    setRoleUpdateTarget(roleUpdateTarget === userId ? null : userId);
  };

  const handleUpdateUserRole = async (userId) => {
    setRoleUpdating(true);
    setRoleUpdateStatus("Updating role...");

    try {
        const user = users.find((u) => u.id === userId);
      const newRole = user.role === "admin" ? "user" : "admin";

          await updateUserRole(userId, newRole);
      setRoleUpdateStatus("User role updated successfully.");
        setRoleUpdateTarget(null);
        loadUsers();
      } catch (error) {
        console.error(error);
        setRoleUpdateStatus("Failed to update user role.");
      } finally {
        setRoleUpdating(false);
      }
    };

  const clearProductForm = () => {
    setEditingProductId(null);
    setProductForm({
      name: "",
      price: "",
      category: "",
      shortDesc: "",
      description: "",
      usageTips: "",
      benefits: "",
    });
    setProductImageFile(null);
    setProductImagePreview("");

    if (productFileRef.current) {
      productFileRef.current.value = "";
    }
  };

  const handleProductFieldChange = (event) => {
    const { name, value } = event.target;
    setProductForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProductImageChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (productImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(productImagePreview);
    }

    setProductImageFile(file);
    setProductImagePreview(file ? URL.createObjectURL(file) : "");
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product._id);
    setProductForm({
      name: product.name || "",
      price: product.price || "",
      category: product.category || "",
      shortDesc: product.shortDesc || "",
      description: product.description || "",
      usageTips: product.usageTips || "",
      benefits: Array.isArray(product.benefits) ? product.benefits.join(", ") : "",
    });
    setProductImageFile(null);
    setProductImagePreview(product.image || "");
    setProductStatus(null);

    if (productFileRef.current) {
      productFileRef.current.value = "";
    }
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();
    setProductSaving(true);
    setProductStatus("Saving product...");

    try {
      const formData = new FormData();

      formData.append("name", productForm.name);
      formData.append("price", productForm.price);
      formData.append("category", productForm.category);
      formData.append("shortDesc", productForm.shortDesc);
      formData.append("description", productForm.description);
      formData.append("usageTips", productForm.usageTips);
      formData.append("benefits", productForm.benefits);

      if (productImageFile) {
        formData.append("image", productImageFile);
      }

      if (editingProductId) {
        await updateProduct(editingProductId, formData);
        setProductStatus("Product updated successfully.");
      } else {
        await createProduct(formData);
        setProductStatus("Product created successfully.");
      }

      clearProductForm();
      loadProducts();
    } catch (error) {
      console.error(error);
      setProductStatus(
        error.response?.data?.message || "Failed to save product."
      );
    } finally {
      setProductSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      await deleteProduct(productId);
      if (editingProductId === productId) {
        clearProductForm();
      }
      loadProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete product.");
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user account?")) {
      try {
        await deleteUser(userId);
        loadUsers();
      } catch (error) {
        alert(
          "Failed to delete user: " +
            (error.response?.data?.message || "Something went wrong")
        );
      }
    }
  };

  

  const filteredUsers = users.filter((user) => {
    const query = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  const filteredProducts = products.filter((product) => {
    const query = productSearch.toLowerCase();
    return (
      product.name?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.shortDesc?.toLowerCase().includes(query)
    );
  });

  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const displayedUsers = filteredUsers.slice(startIndex, endIndex);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="container py-5">
      {orderNotification && (
        <div className="alert alert-success rounded-4 py-3 mb-4" role="alert">
          <strong className="me-2">Notification:</strong>
          {orderNotification}
        </div>
      )}

      <div className="dashboard-welcome-card p-4 mb-4">
        <h2 className="mb-2">Welcome, {username}</h2>
        <p className="mb-1">Admin Access Features</p>
      </div>

      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-white mb-3 admin-dashboard-title">
          Admin Dashboard
        </h1>
        <p className="lead text-muted">
          Manage products, monitor system status, and control access
        </p>
      </div>

      <div className="row g-4 mb-4 align-items-stretch">
        <div className="col-lg-7">
          <div
            className="dashboard-panel-card p-4 h-100"
            style={{
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.86), rgba(30, 41, 59, 0.76))",
              border: "1px solid rgba(34, 211, 238, 0.18)",
            }}
          >
            <div className="dashboard-panel-card-header mb-4">
              <div>
                <h4 className="text-white mb-1">Product Studio</h4>
                <p className="text-white-50 mb-0">
                  Add, edit, remove products, and upload product pictures.
                </p>
              </div>
            </div>

            {productStatus && (
              <div className="alert alert-info rounded-4 py-2 mb-4" role="alert">
                {productStatus}
              </div>
            )}

            <form onSubmit={handleSaveProduct}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control rounded-4"
                    name="name"
                    placeholder="Product name"
                    value={productForm.name}
                    onChange={handleProductFieldChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control rounded-4"
                    name="price"
                    placeholder="Price"
                    value={productForm.price}
                    onChange={handleProductFieldChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control rounded-4"
                    name="category"
                    placeholder="Category"
                    value={productForm.category}
                    onChange={handleProductFieldChange}
                  />
                </div>

                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control rounded-4"
                    name="shortDesc"
                    placeholder="Short description"
                    value={productForm.shortDesc}
                    onChange={handleProductFieldChange}
                  />
                </div>

                <div className="col-12">
                  <textarea
                    className="form-control rounded-4"
                    name="description"
                    rows="3"
                    placeholder="Description"
                    value={productForm.description}
                    onChange={handleProductFieldChange}
                  />
                </div>

                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control rounded-4"
                    name="usageTips"
                    placeholder="Usage tips"
                    value={productForm.usageTips}
                    onChange={handleProductFieldChange}
                  />
                </div>

                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control rounded-4"
                    name="benefits"
                    placeholder="Benefits separated by commas"
                    value={productForm.benefits}
                    onChange={handleProductFieldChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label text-white-50 mb-2">
                    Upload product image
                  </label>
                  <input
                    ref={productFileRef}
                    type="file"
                    className="form-control rounded-4"
                    accept="image/*"
                    onChange={handleProductImageChange}
                  />
                </div>

                <div className="col-12 d-flex flex-wrap align-items-center gap-3">
                  {productImagePreview && (
                    <img
                      src={productImagePreview}
                      alt="Preview"
                      style={{
                        width: "92px",
                        height: "92px",
                        objectFit: "cover",
                        borderRadius: "18px",
                        border: "1px solid rgba(255,255,255,0.14)",
                      }}
                    />
                  )}

                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill px-4 py-2"
                      disabled={productSaving}
                    >
                      {productSaving
                        ? "Saving..."
                        : editingProductId
                          ? "Update Product"
                          : "Add Product"}
                    </button>

                    {editingProductId && (
                      <button
                        type="button"
                        className="btn btn-outline-light rounded-pill px-4 py-2"
                        onClick={clearProductForm}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>

            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mt-4 mb-3">
              <h5 className="text-white mb-0">Existing Products</h5>

              <input
                type="text"
                className="dashboard-search-input"
                placeholder="Search products"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>

            <div className="row g-3">
              {filteredProducts.length === 0 ? (
                <div className="col-12 text-white-50">No products found.</div>
              ) : (
                filteredProducts.map((product) => (
                  <div className="col-md-6" key={product._id}>
                    <div className="card shadow border-0 rounded-4 overflow-hidden h-100">
                      <div style={{ height: "180px", background: "rgba(255,255,255,0.05)" }}>
                        <img
                          src={product.image || "https://via.placeholder.com/500x300?text=No+Image"}
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>

                      <div className="p-3">
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                          <div>
                            <h5 className="mb-1">{product.name}</h5>
                            <p className="text-white-50 mb-1 small">
                              {product.category || "Uncategorized"}
                            </p>
                          </div>
                          <span className="badge text-bg-info">{product.price}</span>
                        </div>

                        <p className="text-white-50 small mb-3">
                          {product.shortDesc || product.description || "No description yet."}
                        </p>

                        <div className="d-flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-light btn-sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div
            className="dashboard-panel-card p-4 h-100"
            style={{
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.86), rgba(30, 41, 59, 0.76))",
              border: "1px solid rgba(34, 211, 238, 0.18)",
            }}
          >
            <div className="dashboard-panel-card-header mb-4">
              <div>
                <h4 className="text-white mb-1">Recent Orders</h4>
                <p className="text-white-50 mb-0">
                  Buyer details, products purchased, and order totals.
                </p>
              </div>
            </div>

            <div className="d-grid gap-3">
              {recentOrders.length === 0 ? (
                <div className="text-white-50">No orders yet.</div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="card shadow border-0 rounded-4 p-3"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <div className="d-flex justify-content-between gap-3 mb-2">
                      <div>
                        <h6 className="mb-1">{order.customerName}</h6>
                        <p className="text-white-50 small mb-1">{order.phone}</p>
                        <p className="text-white-50 small mb-0">{order.address}</p>
                      </div>

                      <div className="text-end">
                        <span className="badge text-bg-warning mb-2">{order.status}</span>
                        <div className="text-info fw-semibold">
                          {order.totalPrice?.toFixed
                            ? order.totalPrice.toFixed(2)
                            : order.totalPrice}
                        </div>
                      </div>
                    </div>

                    {order.notes && (
                      <p className="text-white-50 small mb-2">Note: {order.notes}</p>
                    )}

                    <div className="d-grid gap-2">
                      {order.items?.map((item, index) => (
                        <div
                          key={`${order._id}-${index}`}
                          className="d-flex justify-content-between gap-3 align-items-center rounded-3 px-3 py-2"
                          style={{ background: "rgba(255,255,255,0.05)" }}
                        >
                          <div>
                            <div className="text-white">{item.name}</div>
                            <div className="text-white-50 small">Qty: {item.quantity}</div>
                          </div>
                          <div className="text-info">{item.price}</div>
                        </div>
                      ))}
                    </div>
                  <button
                      className="btn btn-sm btn-success mt-3 w-100"
                      onClick={() => handleDeliverOrder(order._id)}
                    >
                      تسليم الطلب
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="dashboard-panel-card p-4 mb-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.86), rgba(30, 41, 59, 0.76))",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div className="dashboard-panel-card-header mb-4">
          <div>
            <h4 className="text-white mb-1">System Overview</h4>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="dashboard-stat-card p-4 h-100 text-center">
              <h6 className="text-uppercase text-muted mb-3">
                Registered Users
              </h6>
              <p className="display-5 mb-2">{registeredCount}</p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="dashboard-stat-card p-4 h-100 text-center">
              <h6 className="text-uppercase text-muted mb-3">
                Current Online Users
              </h6>
              <p className="display-5 mb-2">{onlineCount}</p>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-4 d-flex justify-content-center">
            <button
              type="button"
              className="btn btn-primary rounded-pill px-4 py-3"
              onClick={handleCheckApiStatus}
            >
              Check API Status
            </button>
          </div>

          <div className="col-md-4 d-flex justify-content-center">
            <button
              type="button"
              className="btn btn-primary rounded-pill px-4 py-3"
              onClick={handleTestResponseTime}
            >
              System Health
            </button>
          </div>

          <div className="col-md-4 d-flex justify-content-center">
            <button
              type="button"
              className="btn btn-primary rounded-pill px-4 py-3"
              onClick={handleCheckDbStatus}
            >
              Check Database Status
            </button>
          </div>
        </div>
      </div>

      {apiStatus && (
        <div
          className={`alert alert-${apiStatusType} rounded-4 py-3 mb-4`}
          role="alert"
        >
          {apiStatus}
        </div>
      )}

      {dbStatus && (
        <div
          className={`alert alert-${dbStatusType} rounded-4 py-3 mb-4`}
          role="alert"
        >
          {dbStatus}
        </div>
      )}

      {responseTime && (
        <div
          className={`alert alert-${responseTimeType} rounded-4 py-3 mb-4`}
          role="alert"
        >
          {responseTime}
        </div>
      )}

      <div
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "24px",
          padding: "40px",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
          minHeight: "600px",
        }}
      >
        <div className="text-center mb-4">
          <h3 className="text-white fw-bold">Users List</h3>
        </div>

        <div className="d-flex justify-content-center mb-4">
          <input
            type="text"
            className="dashboard-search-input"
            placeholder="Search for users by username or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="row g-4">
          {displayedUsers.map((user) => (
            <div className="col-md-6 col-lg-4" key={user.id}>
              <div className="card shadow border-0 rounded-4 p-4 h-100">
                <h5 className="mb-3">{user.name}</h5>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Role:</strong> {user.role}
                </p>

                {user.workoutPlan && user.workoutPlan.length > 0 && (
                  <div className="mb-2">
                    <strong>Workout Goal:</strong> {user.workoutGoal || "N/A"}
                    <br />
                    <strong>Workout Level:</strong> {user.workoutLevel || "N/A"}
                    <br />
                    <strong>Workout Plan:</strong>
                    <ul className="mt-1">
                      {user.workoutPlan.map((item, index) => (
                        <li key={index} className="small">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {user.progress && user.progress.length > 0 && (
                  <div className="mb-3">
                    <strong>Progress:</strong>
                    <ul className="mt-1">
                      {user.progress.map((item, index) => (
                        <li key={index} className="small">
                          {item.day_name} - {item.weight} kg
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(currentUser.role === "admin" || user.role !== "super_admin" )&& (
                  <>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      Remove Account
                    </button>

                    <button
                      className="btn btn-outline-light btn-sm ms-2"
                      onClick={() => handleShowRoleOptions(user.id)}
                    >
                      Update User Role
                    </button>

                    {roleUpdateTarget === user.id && (
                      <div className="mt-3 p-3 bg-white bg-opacity-10 rounded-4">
                        <p className="mb-2 text-muted small">Select new role:</p>

                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleUpdateUserRole(user.id)}
                          disabled={roleUpdating}
                        >
                          {roleUpdating
                            ? "Updating..."
                            : user.role === "admin"
                            ? "Make User"
                            : "Make Admin"}
                        </button>

                        {roleUpdateStatus && (
                          <div
                            className={`alert alert-${
                              roleUpdateStatus.includes("Failed")
                                ? "danger"
                                : "success"
                            } rounded-4 mt-3 py-2 mb-0`}
                            role="alert"
                          >
                            {roleUpdateStatus}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length > cardsPerPage && (
          <div className="d-flex justify-content-between mt-4">
            <button
              className="btn btn-outline-light"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <button
              className="btn btn-outline-light"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={endIndex >= filteredUsers.length}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
