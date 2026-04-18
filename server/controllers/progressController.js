const Progress = require("../models/Progress");

const getProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.id }).sort({ createdAt: -1 });
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

    if (!day_name || !weight) {
      return res.status(400).json({ message: "Day and weight are required" });
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

module.exports = {
  getProgress,
  addProgress,
};