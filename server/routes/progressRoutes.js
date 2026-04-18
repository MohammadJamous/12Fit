const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getProgress, addProgress } = require("../controllers/progressController");

router.get("/", authMiddleware, getProgress);
router.post("/", authMiddleware, addProgress);

module.exports = router;