const Progress = require("../models/Progress");
const { isEmpty, isPositiveNumber } = require("../utils/validators");

const getProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    return res.json(progress);
  } catch (error) {
    return res.status(500).json({ message: "Database error" });
  }
};

const addProgress = async (req, res) => {
  try {
    const {
      day_name,
      weight,
      chest,
      waist,
      hips,
      arms,
      bodyFat,
      notes,
    } = req.body;

    if (isEmpty(day_name) || isEmpty(weight)) {
      return res.status(400).json({ message: "Day and weight are required" });
    }

    if (!isPositiveNumber(weight)) {
      return res.status(400).json({
        message: "Weight must be greater than 0",
      });
    }

    const progress = await Progress.create({
      user: req.user.id,
      day_name,
      weight,
      chest,
      waist,
      hips,
      arms,
      bodyFat,
      notes,
    });

    return res.status(201).json({
      message: "Progress added successfully",
      progress,
    });
  } catch (error) {
    return res.status(500).json({ message: "Insert error" });
  }
};

const updateProgress = async (req, res) => {
  try {
    if (req.body.weight && !isPositiveNumber(req.body.weight)) {
      return res.status(400).json({
        message: "Weight must be greater than 0",
      });
    }

    const progress = await Progress.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      req.body,
      { new: true }
    );

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    return res.json({
      message: "Progress updated successfully",
      progress,
    });
  } catch (error) {
    return res.status(500).json({ message: "Update error" });
  }
};

const deleteProgress = async (req, res) => {
  try {
    const progress = await Progress.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    return res.json({
      message: "Progress deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Delete error" });
  }
};

module.exports = {
  getProgress,
  addProgress,
  updateProgress,
  deleteProgress,
};