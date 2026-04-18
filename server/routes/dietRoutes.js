const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getDietPlan } = require("../controllers/dietController");

router.get("/", authMiddleware, getDietPlan);
router.post("/", authMiddleware, getDietPlan);

module.exports = router;