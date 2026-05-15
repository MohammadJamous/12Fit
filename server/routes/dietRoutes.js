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

/**
 * @swagger
 * /diet/ai-generate:
 *   post:
 *     summary: Generate AI diet plan
 *     tags: [Diet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI diet generated successfully
 */
router.post("/ai-generate", authMiddleware, generateDietWithAI);


/**
 * @swagger
 * /diet/revise:
 *   post:
 *     summary: Revise existing AI diet plan
 *     tags: [Diet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Diet plan revised successfully
 */
router.post("/ai-revise", authMiddleware, reviseDietWithAI);

/**
 * @swagger
 * /diet:
 *   get:
 *     summary: Get user diet plan
 *     tags: [Diet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Diet plan returned successfully
 */
router.get("/", authMiddleware, getDietPlans);
router.post("/save", authMiddleware, createDietPlan);

module.exports = router;