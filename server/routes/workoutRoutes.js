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

router.get("/", authMiddleware, getWorkouts);
router.post("/", authMiddleware, createWorkout);
router.post("/generate", authMiddleware, generateWorkout);
router.put("/:id", authMiddleware, updateWorkout);
router.delete("/:id", authMiddleware, deleteWorkout);

module.exports = router;
