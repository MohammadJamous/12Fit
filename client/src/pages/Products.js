import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createOrder } from "../services/orderService";
import { getProducts } from "../services/productService";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cartItems");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [checkoutData, setCheckoutData] = useState({
    customerName: "",
    phone: "",
    address: "",
    notes: "",
  });

  const placeholderImage =
    "https://via.placeholder.com/500x300?text=12Fit+Product";

  const debounceRef = useRef(null);
  const messageTimerRef = useRef(null);

  const loadProducts = useCallback(async (query) => {
    try {
      setLoading(true);
      const res = await getProducts(query);
      setProducts(res.data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      loadProducts(search);
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [search, loadProducts]);

  useEffect(() => {
    try {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [cartItems]);

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  const showMessage = (text) => {
    setMessage(text);

    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }

    messageTimerRef.current = setTimeout(() => setMessage(""), 2500);
  };

  const addToCart = (product) => {
    const existingProduct = cartItems.find((item) => item._id === product._id);

    if (existingProduct) {
      setCartItems(
        cartItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }

    setSelectedProduct(null);
    showMessage(`${product.name} added to cart`);
  };

  const increaseQuantity = (id) => {
    setCartItems(
      cartItems.map((item) =>
        item._id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems(
      cartItems
        .map((item) =>
          item._id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((item) => item._id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getNumberPrice = (price) => {
    if (!price) return 0;

    const number = price.toString().replace(/[^\d.]/g, "");
    const parsed = Number(number);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + getNumberPrice(item.price) * item.quantity,
        0
      ),
    [cartItems]
  );

  const handleCheckoutChange = (e) => {
    setCheckoutData({
      ...checkoutData,
      [e.target.name]: e.target.value,
    });
  };

  const submitOrder = async () => {
    if (cartItems.length === 0) {
      showMessage("Your cart is empty");
      return;
    }

    if (
      !checkoutData.customerName.trim() ||
      !checkoutData.phone.trim() ||
      !checkoutData.address.trim()
    ) {
      showMessage("Please fill in your name, phone, and address");
      return;
    }

    const orderData = {
      customerName: checkoutData.customerName,
      phone: checkoutData.phone,
      address: checkoutData.address,
      notes: checkoutData.notes,
      paymentMethod: "Cash on Delivery",
      totalPrice,
      items: cartItems.map((item) => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      })),
    };

    try {
      setOrderLoading(true);
      await createOrder(orderData);
      setCartItems([]);
      setCheckoutData({
        customerName: "",
        phone: "",
        address: "",
        notes: "",
      });
      setShowCheckout(false);
      setShowCart(false);
      showMessage("Order placed successfully. We will contact you soon.");
    } catch (error) {
      console.error("Order failed:", error);
      showMessage(error.response?.data?.message || "Failed to place order");
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="products-page">
      <style>
        {`
          .products-page {
            min-height: 100vh;
            background:
              radial-gradient(circle at top left, rgba(0, 212, 255, 0.15), transparent 34%),
              radial-gradient(circle at bottom right, rgba(37, 99, 235, 0.16), transparent 32%),
              linear-gradient(135deg, #07111f 0%, #0b1220 48%, #08101d 100%);
            color: #fff;
            padding: 2.5rem 0 4rem;
          }

          .products-hero {
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.82));
            border: 1px solid rgba(34, 211, 238, 0.18);
            border-radius: 28px;
            padding: 44px 30px;
            box-shadow: 0 22px 70px rgba(0, 0, 0, 0.38);
            backdrop-filter: blur(14px);
          }

          .store-badge {
            background: linear-gradient(135deg, #06b6d4, #2563eb);
            color: #ffffff;
            border-radius: 40px;
            padding: 8px 18px;
            font-weight: 700;
            letter-spacing: 0.3px;
            box-shadow: 0 10px 25px rgba(37, 99, 235, 0.35);
          }

          .products-search {
            width: 100%;
            max-width: 520px;
            border-radius: 18px;
            border: 1px solid rgba(34, 211, 238, 0.25);
            padding: 15px 20px;
            background: rgba(248, 250, 252, 0.96);
            color: #0f172a;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
            outline: none;
          }

          .products-search:focus {
            border-color: #22d3ee;
            box-shadow: 0 0 0 0.25rem rgba(34, 211, 238, 0.22);
          }

          .product-card {
            border-radius: 22px;
            overflow: hidden;
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(17, 24, 39, 0.94));
            color: #ffffff;
            border: 1px solid rgba(148, 163, 184, 0.18);
            cursor: pointer;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.32);
            transition: all 0.25s ease;
            height: 100%;
          }

          .product-card:hover {
            transform: translateY(-8px);
            border-color: rgba(34, 211, 238, 0.55);
            box-shadow:
              0 24px 55px rgba(0, 0, 0, 0.45),
              0 0 22px rgba(34, 211, 238, 0.12);
          }

          .product-img-wrap {
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, #111827, #1e293b);
            border-bottom: 1px solid rgba(148, 163, 184, 0.14);
          }

          .product-img {
            height: 190px;
            width: 100%;
            object-fit: cover;
            transition: transform 0.35s ease, opacity 0.35s ease;
          }

          .product-card:hover .product-img {
            transform: scale(1.07);
            opacity: 0.92;
          }

          .product-badge {
            position: absolute;
            top: 12px;
            left: 12px;
            background: linear-gradient(135deg, #06b6d4, #2563eb);
            color: #fff;
            border-radius: 30px;
            padding: 6px 13px;
            font-size: 0.75rem;
            font-weight: 700;
            box-shadow: 0 8px 22px rgba(37, 99, 235, 0.35);
          }

          .product-title {
            color: #f8fafc;
            line-height: 1.35;
          }

          .product-desc {
            color: #94a3b8;
            font-size: 0.9rem;
            min-height: 44px;
          }

          .price-pill {
            background: rgba(34, 211, 238, 0.12);
            color: #22d3ee;
            border: 1px solid rgba(34, 211, 238, 0.22);
            border-radius: 30px;
            padding: 7px 12px;
            font-weight: 800;
          }

          .cart-floating-btn {
            position: fixed;
            right: 24px;
            bottom: 24px;
            z-index: 1050;
            border: none;
            border-radius: 999px;
            padding: 14px 22px;
            background: linear-gradient(135deg, #06b6d4, #2563eb);
            box-shadow: 0 16px 40px rgba(37, 99, 235, 0.42);
          }

          .cart-floating-btn:hover {
            background: linear-gradient(135deg, #0891b2, #1d4ed8);
            box-shadow: 0 20px 50px rgba(37, 99, 235, 0.55);
          }

          .overlay-shell {
            position: fixed;
            inset: 0;
            z-index: 1100;
            background: rgba(2, 6, 23, 0.72);
            backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 18px;
          }

          .overlay-card {
            width: min(100%, 1100px);
            max-height: min(92vh, 940px);
            overflow: auto;
            border-radius: 28px;
            border: 1px solid rgba(34, 211, 238, 0.18);
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(17, 24, 39, 0.96));
            box-shadow: 0 30px 85px rgba(0, 0, 0, 0.6);
          }

          .overlay-header {
            padding: 22px 26px;
            border-bottom: 1px solid rgba(34, 211, 238, 0.14);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }

          .overlay-body {
            padding: 26px;
          }

          .overlay-close {
            border: none;
            border-radius: 999px;
            width: 42px;
            height: 42px;
            background: rgba(255, 255, 255, 0.08);
            color: #fff;
          }

          .detail-image {
            width: 100%;
            height: 340px;
            object-fit: cover;
            border-radius: 24px;
            border: 1px solid rgba(34, 211, 238, 0.14);
            box-shadow: 0 18px 45px rgba(0, 0, 0, 0.4);
          }

          .detail-panel,
          .checkout-panel,
          .cart-panel {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(34, 211, 238, 0.12);
            border-radius: 20px;
            padding: 20px;
          }

          .muted-line {
            color: #cbd5e1;
          }

          .cart-item {
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.07);
            border: 1px solid rgba(34, 211, 238, 0.12);
            padding: 14px;
            color: #f8fafc;
          }

          .cart-img {
            width: 68px;
            height: 68px;
            object-fit: cover;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .checkout-input {
            width: 100%;
            border-radius: 14px;
            border: 1px solid rgba(148, 163, 184, 0.2);
            background: rgba(15, 23, 42, 0.9);
            color: #f8fafc;
            padding: 13px 15px;
            outline: none;
          }

          .checkout-input:focus {
            border-color: #22d3ee;
            box-shadow: 0 0 0 0.2rem rgba(34, 211, 238, 0.18);
          }

          .checkout-input::placeholder {
            color: #94a3b8;
          }

          .message-toast {
            position: fixed;
            left: 50%;
            transform: translateX(-50%);
            bottom: 26px;
            z-index: 1200;
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.95), rgba(37, 99, 235, 0.92));
            color: white;
            padding: 14px 20px;
            border-radius: 999px;
            box-shadow: 0 18px 45px rgba(37, 99, 235, 0.35);
            font-weight: 700;
          }
        `}
      </style>

      <div className="container">
        <div className="products-hero mb-4">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
            <div>
              <span className="store-badge d-inline-flex mb-3">12Fit Store</span>
              <h1 className="display-5 fw-bold mb-2">Products</h1>
              <p className="lead mb-0 text-light-emphasis">
                Discover supplements and essentials, add them to your cart, and
                place an order in a few steps.
              </p>
            </div>

            <div className="w-100 d-flex justify-content-lg-end">
              <input
                type="text"
                className="products-search"
                placeholder="Search products by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5 text-white-50">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-5 text-white-50">
            No products found.
          </div>
        ) : (
          <div className="row g-4">
            {products.map((product) => (
              <div className="col-sm-6 col-lg-4" key={product._id}>
                <div className="product-card" onClick={() => setSelectedProduct(product)}>
                  <div className="product-img-wrap">
                    <img
                      src={product.image || placeholderImage}
                      alt={product.name}
                      className="product-img"
                    />
                    <div className="product-badge">
                      {product.category || "Featured"}
                    </div>
                  </div>

                  <div className="p-4">
                    <h5 className="product-title mb-2">{product.name}</h5>
                    <p className="product-desc mb-3">
                      {product.shortDesc ||
                        product.description ||
                        "Premium fitness product with clean ingredients and practical benefits."}
                    </p>

                    <div className="d-flex align-items-center justify-content-between gap-3">
                      <span className="price-pill">{product.price}</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-light"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                        }}
                      >
                        View details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        className="cart-floating-btn btn btn-primary"
        onClick={() => setShowCart(true)}
      >
        Cart ({cartCount})
      </button>

      {message && <div className="message-toast">{message}</div>}

      {selectedProduct && (
        <div className="overlay-shell" onClick={() => setSelectedProduct(null)}>
          <div className="overlay-card" onClick={(e) => e.stopPropagation()}>
            <div className="overlay-header">
              <div>
                <div className="store-badge d-inline-flex mb-2">Product Details</div>
                <h3 className="mb-0">{selectedProduct.name}</h3>
              </div>
              <button
                type="button"
                className="overlay-close"
                onClick={() => setSelectedProduct(null)}
              >
                ×
              </button>
            </div>

            <div className="overlay-body">
              <div className="row g-4 align-items-start">
                <div className="col-lg-6">
                  <img
                    src={selectedProduct.image || placeholderImage}
                    alt={selectedProduct.name}
                    className="detail-image"
                  />
                </div>

                <div className="col-lg-6">
                  <div className="detail-panel h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="price-pill">{selectedProduct.price}</span>
                      <span className="text-info fw-semibold">
                        {selectedProduct.category || "Fitness"}
                      </span>
                    </div>

                    <p className="muted-line mb-3">
                      {selectedProduct.shortDesc || selectedProduct.description}
                    </p>

                    {selectedProduct.description && (
                      <div className="mb-3">
                        <h6 className="text-white">Description</h6>
                        <p className="muted-line mb-0">{selectedProduct.description}</p>
                      </div>
                    )}

                    {selectedProduct.usageTips && (
                      <div className="mb-3">
                        <h6 className="text-white">Usage Tips</h6>
                        <p className="muted-line mb-0">{selectedProduct.usageTips}</p>
                      </div>
                    )}

                    {Array.isArray(selectedProduct.benefits) &&
                      selectedProduct.benefits.length > 0 && (
                        <div className="mb-4">
                          <h6 className="text-white">Benefits</h6>
                          <ul className="muted-line mb-0 ps-3">
                            {selectedProduct.benefits.map((benefit, index) => (
                              <li key={index}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    <button
                      type="button"
                      className="btn btn-primary px-4 py-3 rounded-pill"
                      onClick={() => addToCart(selectedProduct)}
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCart && (
        <div className="overlay-shell" onClick={() => setShowCart(false)}>
          <div className="overlay-card" onClick={(e) => e.stopPropagation()}>
            <div className="overlay-header">
              <div>
                <div className="store-badge d-inline-flex mb-2">Your Cart</div>
                <h3 className="mb-0">Checkout Area</h3>
              </div>
              <button
                type="button"
                className="overlay-close"
                onClick={() => setShowCart(false)}
              >
                ×
              </button>
            </div>

            <div className="overlay-body">
              {!showCheckout ? (
                <div className="row g-4">
                  <div className="col-lg-7">
                    <div className="cart-panel h-100">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <h5 className="mb-0">Cart Items</h5>
                        <button className="btn btn-sm btn-outline-light" onClick={clearCart}>
                          Clear Cart
                        </button>
                      </div>

                      {cartItems.length === 0 ? (
                        <p className="text-white-50 mb-0">Your cart is empty.</p>
                      ) : (
                        <div className="d-grid gap-3">
                          {cartItems.map((item) => (
                            <div key={item._id} className="cart-item">
                              <div className="d-flex gap-3 align-items-start">
                                <img
                                  src={item.image || placeholderImage}
                                  alt={item.name}
                                  className="cart-img"
                                />
                                <div className="flex-grow-1">
                                  <div className="d-flex justify-content-between gap-2">
                                    <div>
                                      <h6 className="mb-1">{item.name}</h6>
                                      <p className="mb-1 text-white-50 small">{item.price}</p>
                                    </div>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => removeFromCart(item._id)}
                                    >
                                      Remove
                                    </button>
                                  </div>

                                  <div className="d-flex align-items-center gap-2 mt-2">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-light"
                                      onClick={() => decreaseQuantity(item._id)}
                                    >
                                      -
                                    </button>
                                    <span className="fw-semibold">{item.quantity}</span>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-light"
                                      onClick={() => increaseQuantity(item._id)}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <span className="text-white-50">Total</span>
                            <span className="price-pill">{totalPrice.toFixed(2)}</span>
                          </div>

                          <button
                            type="button"
                            className="btn btn-primary rounded-pill px-4 py-3 mt-2"
                            onClick={() => setShowCheckout(true)}
                            disabled={cartItems.length === 0}
                          >
                            Continue to checkout
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-5">
                    <div className="checkout-panel h-100">
                      <h5 className="mb-3">Order Summary</h5>
                      <p className="text-white-50 mb-2">Items: {cartCount}</p>
                      <p className="text-white-50 mb-2">Subtotal: {totalPrice.toFixed(2)}</p>
                      <p className="text-white-50 mb-0">
                        Delivery: Cash on Delivery
                      </p>

                      <div className="mt-4 p-3 rounded-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <p className="mb-1 fw-semibold text-white">Fast checkout</p>
                        <p className="mb-0 text-white-50 small">
                          Fill your contact details on the next step to send the order.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="row g-4">
                  <div className="col-lg-7">
                    <div className="checkout-panel">
                      <h5 className="mb-3">Customer Details</h5>

                      <div className="d-grid gap-3">
                        <input
                          type="text"
                          name="customerName"
                          className="checkout-input"
                          placeholder="Full name"
                          value={checkoutData.customerName}
                          onChange={handleCheckoutChange}
                        />
                        <input
                          type="text"
                          name="phone"
                          className="checkout-input"
                          placeholder="Phone number"
                          value={checkoutData.phone}
                          onChange={handleCheckoutChange}
                        />
                        <input
                          type="text"
                          name="address"
                          className="checkout-input"
                          placeholder="Delivery address"
                          value={checkoutData.address}
                          onChange={handleCheckoutChange}
                        />
                        <textarea
                          name="notes"
                          rows="4"
                          className="checkout-input"
                          placeholder="Order notes (optional)"
                          value={checkoutData.notes}
                          onChange={handleCheckoutChange}
                        />
                      </div>

                      <div className="d-flex gap-3 mt-4">
                        <button
                          type="button"
                          className="btn btn-outline-light rounded-pill px-4 py-3"
                          onClick={() => setShowCheckout(false)}
                        >
                          Back to cart
                        </button>

                        <button
                          type="button"
                          className="btn btn-primary rounded-pill px-4 py-3"
                          onClick={submitOrder}
                          disabled={orderLoading}
                        >
                          {orderLoading ? "Placing order..." : "Place order"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-5">
                    <div className="checkout-panel h-100">
                      <h5 className="mb-3">Your Order</h5>
                      <div className="d-grid gap-2 mb-4">
                        {cartItems.map((item) => (
                          <div key={item._id} className="cart-item">
                            <div className="d-flex justify-content-between gap-2">
                              <span>{item.name}</span>
                              <span className="text-info fw-semibold">x{item.quantity}</span>
                            </div>
                            <div className="text-white-50 small">{item.price}</div>
                          </div>
                        ))}
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-white-50">Total</span>
                        <span className="price-pill">{totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;