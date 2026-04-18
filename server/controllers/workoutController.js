const Workout = require("../models/Workout");

const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json(workouts);
  } catch (error) {
    return res.status(500).json({ message: "Database error" });
  }
};

const createWorkout = async (req, res) => {
  try {
    const { goal, level, plan } = req.body;

    const workout = await Workout.create({
      user: req.user.id,
      goal: goal || "",
      level: level || "",
      plan: Array.isArray(plan) ? plan : [],
    });

    return res.status(201).json({
      message: "Workout created successfully",
      workout,
    });
  } catch (error) {
    return res.status(500).json({ message: "Insert error" });
  }
};

module.exports = {
  getWorkouts,
  createWorkout,
};