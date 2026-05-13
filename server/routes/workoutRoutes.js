const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} = require("../controllers/workoutController");

/**
 * @swagger
 * /workouts:
 *   get:
 *     summary: Get user workouts
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workouts
 */
router.get("/", authMiddleware, getWorkouts);

/**
 * @swagger
 * /workouts:
 *   post:
 *     summary: Create workout
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkoutInput'
 *     responses:
 *       201:
 *         description: Workout created
 */
router.post("/", authMiddleware, createWorkout);

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
 *         description: Workout updated
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
 *         description: Workout deleted
 */
router.delete("/:id", authMiddleware, deleteWorkout);

module.exports = router;