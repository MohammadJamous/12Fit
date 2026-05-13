const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getWorkouts,
  createWorkout, 
  generateWorkout,
} = require("../controllers/workoutController");
/**
 * @route   
 */
router.get("/", authMiddleware, getWorkouts);
/**
 * @route   
 */
router.post("/", authMiddleware, createWorkout);
/**
 * @route   
 * @desc  
 */
router.post("/generate", generateWorkout);
module.exports = router;
