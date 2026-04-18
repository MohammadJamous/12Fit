const express = require("express");
const router = express.Router();

const {
  getUsersWithPlans,
  deleteUser,
  getRegisteredUsersCount,
  getOnlineUsersCount,
  updateUserRole,
  checkApiStatus,
  checkDbStatus,
  getUptime,
  getDbPing,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/with-plans", authMiddleware, adminMiddleware, getUsersWithPlans);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);
router.get("/count", authMiddleware, adminMiddleware, getRegisteredUsersCount);
router.get("/online-count", authMiddleware, adminMiddleware, getOnlineUsersCount);
router.put("/:id/role", authMiddleware, adminMiddleware, updateUserRole);

router.get("/api-status", authMiddleware, adminMiddleware, checkApiStatus);
router.get("/db-status", authMiddleware, adminMiddleware, checkDbStatus);
router.get("/uptime", authMiddleware, adminMiddleware, getUptime);
router.get("/db-ping", authMiddleware, adminMiddleware, getDbPing);

module.exports = router;