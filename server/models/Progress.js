const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    day_name: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    chest: Number,
    waist: Number,
    hips: Number,
    arms: Number,
    bodyFat: Number,
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", progressSchema);