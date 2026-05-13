const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  generateDiet,
  generateDietWithAI,
  reviseDietWithAI,
  getDietPlans,
  createDietPlan,
} = require("../controllers/dietController");

router.post("/", authMiddleware, generateDiet);
router.post("/ai-generate", authMiddleware, generateDietWithAI);
router.post("/ai-revise", authMiddleware, reviseDietWithAI);
router.get("/", authMiddleware, getDietPlans);
router.post("/save", authMiddleware, createDietPlan);

module.exports = router;
