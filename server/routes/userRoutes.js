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

/**
 * @swagger
 * /users/with-plans:
 *   get:
 *     summary: Get all users with plans admin only
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users with workout and progress data
 */
router.get("/with-plans", authMiddleware, adminMiddleware, getUsersWithPlans);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

/**
 * @swagger
 * /users/count:
 *   get:
 *     summary: Get registered users count admin only
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users count
 */
router.get("/count", authMiddleware, adminMiddleware, getRegisteredUsersCount);

/**
 * @swagger
 * /users/online-count:
 *   get:
 *     summary: Get online users count admin only
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Online users count
 */
router.get("/online-count", authMiddleware, adminMiddleware, getOnlineUsersCount);
router.put("/:id/role", authMiddleware, adminMiddleware, updateUserRole);

router.get("/api-status", authMiddleware, adminMiddleware, checkApiStatus);
router.get("/db-status", authMiddleware, adminMiddleware, checkDbStatus);
router.get("/uptime", authMiddleware, adminMiddleware, getUptime);
router.get("/db-ping", authMiddleware, adminMiddleware, getDbPing);

module.exports = router;