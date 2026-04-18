const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { getProducts, createProduct } = require("../controllers/productController");

router.get("/", getProducts);
router.post("/", authMiddleware, adminMiddleware, createProduct);

module.exports = router;