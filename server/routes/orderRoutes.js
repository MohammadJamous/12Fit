const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

 
router.post("/", createOrder);
router.get("/", authMiddleware, adminMiddleware, getOrders);
router.get("/:id", authMiddleware, adminMiddleware, getOrderById);
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);
router.delete("/:id", authMiddleware, adminMiddleware, deleteOrder);

module.exports = router;