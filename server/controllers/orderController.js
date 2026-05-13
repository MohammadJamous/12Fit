const Order = require("../models/Order");

const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      address,
      notes,
      paymentMethod,
      items,
      totalPrice,
    } = req.body;

    if (!customerName || !phone || !address) {
      return res.status(400).json({
        message: "Customer name, phone, and address are required",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Order must contain at least one product",
      });
    }

    const order = await Order.create({
      customerName,
      phone,
      address,
      notes: notes || "",
      paymentMethod: paymentMethod || "Cash on Delivery",
      items,
      totalPrice: totalPrice || 0,
      status: "Pending",
    });

    const io = req.app.get("io");

    if (io) {
      io.emit("newOrder", order);
    }

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Order creation failed",
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({
      message: "Database error",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.json(order);
  } catch (error) {
    return res.status(500).json({
      message: "Database error",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Processing", "Delivered", "Cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Update failed",
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Delete failed",
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};