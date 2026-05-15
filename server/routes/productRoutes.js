const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");
const {
	getProducts,
	createProduct,
	updateProduct,
	deleteProduct,
} = require("../controllers/productController");

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Products returned successfully
 */
router.get("/", getProducts);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create product admin only
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post("/", authMiddleware, adminMiddleware, upload.single("image"), createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update product admin only
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product admin only
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;