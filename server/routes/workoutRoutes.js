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
 * @route GET /api/v1/workouts
 * @desc Get all workouts for logged in user
 * @access Private
 */
router.get("/", authMiddleware, getWorkouts);

/**
 * @route POST /api/v1/workouts
 * @desc Create workout manually
 * @access Private
 */
router.post("/", authMiddleware, createWorkout);

/**
 * @route POST /api/v1/workouts/generate
 * @desc Generate AI workout plan
 * @access Private
 */
router.post("/generate", authMiddleware, generateWorkout);

/**
 * @route PUT /api/v1/workouts/:id
 * @desc Update workout
 * @access Private
 */
router.put("/:id", authMiddleware, updateWorkout);

/**
 * @route DELETE /api/v1/workouts/:id
 * @desc Delete workout
 * @access Private
 */
router.delete("/:id", authMiddleware, deleteWorkout);

module.exports = router;
