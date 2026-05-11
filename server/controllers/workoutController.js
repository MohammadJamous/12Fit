const Workout = require("../models/Workout");
const { isEmpty } = require("../utils/validators");

const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    return res.json(workouts);
  } catch (error) {
    return res.status(500).json({ message: "Database error" });
  }
};

const createWorkout = async (req, res) => {
  try {
    const { goal, level, plan } = req.body;

    if (isEmpty(goal) || isEmpty(level)) {
      return res.status(400).json({
        message: "Goal and level are required",
      });
    }

    if (!Array.isArray(plan)) {
      return res.status(400).json({
        message: "Plan must be an array",
      });
    }

    const workout = await Workout.create({
      user: req.user.id,
      goal,
      level,
      plan,
    });

    return res.status(201).json({
      message: "Workout created successfully",
      workout,
    });
  } catch (error) {
    return res.status(500).json({ message: "Insert error" });
  }
};

const updateWorkout = async (req, res) => {
  try {
    if (req.body.plan && !Array.isArray(req.body.plan)) {
      return res.status(400).json({
        message: "Plan must be an array",
      });
    }

    const workout = await Workout.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      req.body,
      { new: true }
    );

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    return res.json({
      message: "Workout updated successfully",
      workout,
    });
  } catch (error) {
    return res.status(500).json({ message: "Update error" });
  }
};

const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    return res.json({
      message: "Workout deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Delete error" });
  }
};

module.exports = {
  getWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
};