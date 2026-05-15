const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getWorkouts,
  createWorkout,
  generateWorkout,
  updateWorkout,
  deleteWorkout,
} = require("../controllers/workoutController");

/**
 * @swagger
 * /workouts:
 *   get:
 *     summary: Get logged-in user's workouts
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workouts returned successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, getWorkouts);

/**
 * @swagger
 * /workouts:
 *   post:
 *     summary: Create workout manually
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Workout created successfully
 */
router.post("/", authMiddleware, createWorkout);

/**
 * @swagger
 * /workouts/generate:
 *   post:
 *     summary: Generate AI workout plan
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: AI workout generated successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/generate", authMiddleware, generateWorkout);

/**
 * @swagger
 * /workouts/{id}:
 *   put:
 *     summary: Update workout
 *     tags: [Workouts]
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
 *         description: Workout updated successfully
 *       404:
 *         description: Workout not found
 */
router.put("/:id", authMiddleware, updateWorkout);

/**
 * @swagger
 * /workouts/{id}:
 *   delete:
 *     summary: Delete workout
 *     tags: [Workouts]
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
 *         description: Workout deleted successfully
 *       404:
 *         description: Workout not found
 */
router.delete("/:id", authMiddleware, deleteWorkout);

module.exports = router;