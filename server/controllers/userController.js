const mongoose = require("mongoose");
const User = require("../models/User");
const Workout = require("../models/Workout");
const Progress = require("../models/Progress");
const { isValidRole } = require("../utils/validators");

const getUsersWithPlans = async (req, res) => {
  try {

    const users = await User.find().select("name email role").sort({ createdAt: -1 });

    const usersWithPlans = await Promise.all(
      users.map(async (user) => {
        const workout = await Workout.findOne({ user: user._id });
        const progress = await Progress.find({ user: user._id }).sort({ createdAt: -1 });

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          workoutGoal: workout?.goal || null,
          workoutLevel: workout?.level || null,
          workoutPlan: workout?.plan || [],
          progress,
        };
      })
    );

    return res.json(usersWithPlans);
  } catch (error) {
    return res.status(500).json({ message: "Database error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        message: "Only super admin can delete users",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "super_admin") {
      return res.status(403).json({
        message: "Cannot delete super admin",
      });
    }

    await User.findByIdAndDelete(userId);
    await Workout.deleteMany({ user: userId });
    await Progress.deleteMany({ user: userId });

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Delete error" });
  }
};

const getRegisteredUsersCount = async (req, res) => {
  try {
    const total = await User.countDocuments();
    return res.json({ total });
  } catch (error) {
    return res.status(500).json({ message: "Count error" });
  }
};

const getOnlineUsersCount = async (req, res) => {
  const onlineUsers = req.app.get("onlineUsers");
 
  const online =
    typeof onlineUsers === "number"
      ? onlineUsers
      : onlineUsers?.size || 0;

  return res.json({ online });
};

const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role: newRole } = req.body;

  try {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        message: "Only super admin can change roles",
      });
    }

    if (req.user?.id === id) {
      return res.status(400).json({
        message: "You cannot change your own role",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "super_admin") {
      return res.status(403).json({
        message: "Cannot change super admin role",
      });
    }

    if (newRole === "super_admin") {
      return res.status(403).json({
        message: "Cannot assign super admin role",
      });
    }

    user.role = newRole;
    await user.save();

    return res.json({
      message: "User role updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Update error",
    });
  }
}; 

const checkApiStatus = async (req, res) => {
  return res.json({ status: "API is working" });
};

const checkDbStatus = async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const statusMap = {
      0: "MongoDB disconnected",
      1: "MongoDB connected",
      2: "MongoDB connecting",
      3: "MongoDB disconnecting",
    };

    return res.json({
      status: statusMap[state] || "Unknown database status",
    });
  } catch (error) {
    return res.status(500).json({ message: "DB status error" });
  }
};

const getUptime = async (req, res) => {
  return res.json({ uptime: process.uptime() });
};

const getDbPing = async (req, res) => {
  try {
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    const dbPingTime = Date.now() - start;

    return res.json({ dbPingTime });
  } catch (error) {
    return res.status(500).json({ message: "DB ping error" });
  }
};

module.exports = {
  getUsersWithPlans,
  deleteUser,
  getRegisteredUsersCount,
  getOnlineUsersCount,
  updateUserRole,
  checkApiStatus,
  checkDbStatus,
  getUptime,
  getDbPing,
};