const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getProgress,
  addProgress,
  updateProgress,
  deleteProgress,
} = require("../controllers/progressController");

/**
 * @swagger
 * /progress:
 *   get:
 *     summary: Get user progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of progress entries
 */
router.get("/", authMiddleware, getProgress);

/**
 * @swagger
 * /progress:
 *   post:
 *     summary: Add progress entry
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProgressInput'
 *     responses:
 *       201:
 *         description: Progress added
 */
router.post("/", authMiddleware, addProgress);

/**
 * @swagger
 * /progress/{id}:
 *   put:
 *     summary: Update progress entry
 *     tags: [Progress]
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
 *         description: Progress updated
 */
router.put("/:id", authMiddleware, updateProgress);

/**
 * @swagger
 * /progress/{id}:
 *   delete:
 *     summary: Delete progress entry
 *     tags: [Progress]
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
 *         description: Progress deleted
 */
router.delete("/:id", authMiddleware, deleteProgress);

module.exports = router;