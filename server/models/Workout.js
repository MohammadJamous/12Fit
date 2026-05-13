const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    weight: {
      type: Number,
      required: true,
    },

    height: {
      type: Number,
      required: true,
    },

    activity: {
      type: String,
      required: true,
      trim: true,
    },

    goal: {
      type: String,
      required: true,
      trim: true,
    },

    diet: {
      type: String,
      default: "",
      trim: true,
    },

    plan: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workout", workoutSchema);
