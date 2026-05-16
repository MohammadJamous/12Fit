const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const {
  generateDietSchema,
  reviseDietSchema,
  saveDietPlanSchema,
} = require("../utils/dietValidator");

const {
  generateDiet,
  generateDietWithAI,
  reviseDietWithAI,
  getDietPlans,
  createDietPlan,
} = require("../controllers/dietController");

// Diet routes handle generating, revising, saving,
// and retrieving nutrition plans for authenticated users.
router.post("/", authMiddleware, validate(generateDietSchema), generateDiet);
router.post("/ai-generate", authMiddleware, validate(generateDietSchema), generateDietWithAI);
router.post("/ai-revise", authMiddleware, validate(reviseDietSchema), reviseDietWithAI);
router.get("/", authMiddleware, getDietPlans);
router.post("/save", authMiddleware, validate(saveDietPlanSchema), createDietPlan);

module.exports = router;
