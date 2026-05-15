const Diet = require("../models/Diet");
const {
  generateAIDietPlan,
  reviseAIDietPlan,
} = require("../services/aiDietService");

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_CONFIG = {
  "lose weight": {
    calorieAdjustment: -450,
    proteinPerKg: 1.8,
    fatPercent: 0.27,
  },
  "muscle gain": {
    calorieAdjustment: 300,
    proteinPerKg: 2.0,
    fatPercent: 0.25,
  },
  "weight gain": {
    calorieAdjustment: 450,
    proteinPerKg: 1.7,
    fatPercent: 0.28,
  },
  "general fitness": {
    calorieAdjustment: 0,
    proteinPerKg: 1.6,
    fatPercent: 0.27,
  },
};

const containsAny = (text = "", keywords = []) => {
  const lower = String(text).toLowerCase();
  return keywords.some((word) => lower.includes(word));
};

const getBmiCategory = (bmi) => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

const calculateBMR = ({ weight, height, age, gender }) => {
  if (gender === "male") {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  }
  return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
};

const calculateMacros = ({ targetCalories, weight, goal }) => {
  const config = GOAL_CONFIG[goal] || GOAL_CONFIG["general fitness"];
  const proteinGrams = Math.round(weight * config.proteinPerKg);
  const fatGrams = Math.round((targetCalories * config.fatPercent) / 9);
  const carbCalories = targetCalories - proteinGrams * 4 - fatGrams * 9;
  const carbGrams = Math.max(0, Math.round(carbCalories / 4));

  return {
    protein: `${proteinGrams} g`,
    carbs: `${carbGrams} g`,
    fats: `${fatGrams} g`,
  };
};

const buildFlags = ({ injuries, medicalConditions, dietaryRestrictions }) => {
  const fullHealthText = [injuries || "", medicalConditions || "", dietaryRestrictions || ""].join(" | ");

  return {
    diabetes: containsAny(fullHealthText, ["diabetes", "diabetic", "سكر", "سكري"]),
    hypertension: containsAny(fullHealthText, ["pressure", "hypertension", "blood pressure", "ضغط"]),
    lactose: containsAny(fullHealthText, ["lactose", "dairy", "milk intolerance"]),
    gluten: containsAny(fullHealthText, ["gluten", "celiac"]),
    peanut: containsAny(fullHealthText, ["peanut allergy", "peanut"]),
    kidney: containsAny(fullHealthText, ["kidney", "renal"]),
    vegetarian: containsAny(fullHealthText, ["vegetarian", "vegan"]),
  };
};

const buildFallbackDietPlan = ({
  goal,
  targetCalories,
  flags,
  preferredFoods,
  dislikedFoods,
}) => {
  const calories = {
    breakfast: Math.round(targetCalories * 0.25),
    snack1: Math.round(targetCalories * 0.1),
    lunch: Math.round(targetCalories * 0.3),
    snack2: Math.round(targetCalories * 0.1),
    dinner: Math.round(targetCalories * 0.25),
  };

  const dairyBase = flags.lactose ? "lactose-free yogurt or soy yogurt" : "Greek yogurt or low-fat milk";
  const proteinBase = flags.vegetarian ? "lentils, beans, tofu, or chickpeas" : "chicken, eggs, tuna, or lean beef";
  const carbBase = flags.diabetes ? "brown rice or oats" : "rice, oats, or whole grain bread";

  const dislikeLine = dislikedFoods?.trim()
    ? `Avoid these when possible: ${dislikedFoods}.`
    : null;

  const preferLine = preferredFoods?.trim()
    ? `Include these when possible: ${preferredFoods}.`
    : null;

  const basePlan =
    goal === "muscle gain"
      ? [
          {
            meal: "Breakfast",
            calories: calories.breakfast,
            items: [`Eggs or ${proteinBase}`, `${carbBase}`, dairyBase],
          },
          {
            meal: "Snack 1",
            calories: calories.snack1,
            items: ["Banana or dates", "Nuts or seeds"],
          },
          {
            meal: "Lunch",
            calories: calories.lunch,
            items: [`Protein from ${proteinBase}`, "Rice or potatoes", "Vegetables or salad"],
          },
          {
            meal: "Snack 2",
            calories: calories.snack2,
            items: [dairyBase, "Fruit or oats"],
          },
          {
            meal: "Dinner",
            calories: calories.dinner,
            items: [`Protein from ${proteinBase}`, "Sweet potato or rice", "Cooked vegetables"],
          },
        ]
      : goal === "weight gain"
      ? [
          {
            meal: "Breakfast",
            calories: calories.breakfast,
            items: ["Eggs or cheese alternative", "Bread or oats", dairyBase],
          },
          {
            meal: "Snack 1",
            calories: calories.snack1,
            items: ["Dates or banana", "Nuts or seeds"],
          },
          {
            meal: "Lunch",
            calories: calories.lunch,
            items: [`Protein from ${proteinBase}`, "Rice or pasta", "Vegetables"],
          },
          {
            meal: "Snack 2",
            calories: calories.snack2,
            items: [dairyBase, "Sandwich or smoothie"],
          },
          {
            meal: "Dinner",
            calories: calories.dinner,
            items: [`Protein from ${proteinBase}`, "Rice or pasta", "Healthy fats"],
          },
        ]
      : goal === "lose weight"
      ? [
          {
            meal: "Breakfast",
            calories: calories.breakfast,
            items: ["Oats with fruit", dairyBase],
          },
          {
            meal: "Snack 1",
            calories: calories.snack1,
            items: ["Apple or berries", "Almonds or seeds"],
          },
          {
            meal: "Lunch",
            calories: calories.lunch,
            items: [`Protein from ${proteinBase}`, `Moderate ${carbBase}`, "Large salad"],
          },
          {
            meal: "Snack 2",
            calories: calories.snack2,
            items: [dairyBase, "Light whole-food snack"],
          },
          {
            meal: "Dinner",
            calories: calories.dinner,
            items: ["Vegetable soup", `Lean ${proteinBase}`, "Light dinner"],
          },
        ]
      : [
          {
            meal: "Breakfast",
            calories: calories.breakfast,
            items: ["Whole grain breakfast", dairyBase],
          },
          {
            meal: "Snack 1",
            calories: calories.snack1,
            items: ["Fresh fruit", "Yogurt or seeds"],
          },
          {
            meal: "Lunch",
            calories: calories.lunch,
            items: [`Balanced ${proteinBase}`, carbBase, "Vegetables"],
          },
          {
            meal: "Snack 2",
            calories: calories.snack2,
            items: ["Light sandwich or yogurt", "Water"],
          },
          {
            meal: "Dinner",
            calories: calories.dinner,
            items: [`Light ${proteinBase} dinner`, "Vegetables", "Balanced carbs"],
          },
        ];

  return basePlan.map((meal) => ({
    ...meal,
    items: [
      ...meal.items,
      ...(preferLine ? [preferLine] : []),
      ...(dislikeLine ? [dislikeLine] : []),
    ],
  }));
};

const buildNotes = ({
  bmiCategory,
  medicalConditions,
  injuries,
  dietaryRestrictions,
  preferredFoods,
  dislikedFoods,
  flags,
  aiUsed,
}) => {
  const notes = [
    `Your BMI category is ${bmiCategory}.`,
    aiUsed
      ? "This plan was generated with AI assistance for general wellness guidance."
      : "AI was unavailable, so a fallback diet plan was generated locally.",
    "This plan is not a substitute for professional medical advice.",
  ];

  if (medicalConditions?.trim()) {
    notes.push(`Medical conditions considered: ${medicalConditions}.`);
  }

  if (injuries?.trim()) {
    notes.push(`Injuries/health notes considered: ${injuries}.`);
  }

  if (dietaryRestrictions?.trim()) {
    notes.push(`Dietary restrictions considered: ${dietaryRestrictions}.`);
  }

  if (preferredFoods?.trim()) {
    notes.push(`Preferred foods considered: ${preferredFoods}.`);
  }

  if (dislikedFoods?.trim()) {
    notes.push(`Disliked foods avoided where possible: ${dislikedFoods}.`);
  }

  if (flags.diabetes) {
    notes.push("Higher-fiber carbohydrate choices and lower refined sugars were prioritized.");
  }

  if (flags.hypertension) {
    notes.push("Lower-sodium meal choices were prioritized.");
  }

  if (flags.lactose) {
    notes.push("Lactose-light or lactose-free choices were considered.");
  }

  if (flags.gluten) {
    notes.push("Gluten-sensitive friendly choices were considered.");
  }

  if (flags.kidney) {
    notes.push("Because kidney-related concerns were mentioned, professional nutrition review is strongly recommended.");
  }

  return notes;
};

exports.generateDiet = async (req, res) => {
  try {
    const {
      name,
      age,
      weight,
      height,
      gender,
      fitnessLevel,
      activityLevel,
      goal,
      injuries,
      medicalConditions,
      dietaryRestrictions,
      preferredFoods,
      dislikedFoods,
    } = req.body;

    const userId = String(req.user?.id || "");

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (
      !name ||
      !age ||
      !weight ||
      !height ||
      !gender ||
      !fitnessLevel ||
      !activityLevel ||
      !goal
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const ageNum = Number(age);
    const weightNum = Number(weight);
    const heightNum = Number(height);

    const bmi = Number((weightNum / ((heightNum / 100) ** 2)).toFixed(1));
    const bmiCategory = getBmiCategory(bmi);
    const bmr = calculateBMR({
      weight: weightNum,
      height: heightNum,
      age: ageNum,
      gender,
    });

    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
    const tdee = Math.round(bmr * multiplier);
    const goalSettings = GOAL_CONFIG[goal] || GOAL_CONFIG["general fitness"];
    const targetCalories = Math.max(1200, tdee + goalSettings.calorieAdjustment);
    const macros = calculateMacros({
      targetCalories,
      weight: weightNum,
      goal,
    });

    const flags = buildFlags({
      injuries,
      medicalConditions,
      dietaryRestrictions,
    });

    const dietPlan = buildFallbackDietPlan({
      goal,
      targetCalories,
      flags,
      preferredFoods,
      dislikedFoods,
    });

    const notes = buildNotes({
      bmiCategory,
      medicalConditions,
      injuries,
      dietaryRestrictions,
      preferredFoods,
      dislikedFoods,
      flags,
      aiUsed: false,
    });

    const savedDiet = await Diet.create({
      user_id: userId,
      name,
      age: ageNum,
      weight: weightNum,
      height: heightNum,
      gender,
      fitnessLevel,
      activityLevel,
      goal,
      injuries,
      medicalConditions,
      dietaryRestrictions,
      preferredFoods,
      dislikedFoods,
      bmi,
      bmiCategory,
      bmr,
      tdee,
      targetCalories,
      macros,
      plan: dietPlan,
      notes,
    });

    return res.json({
      message: "Diet plan generated successfully",
      bmi,
      bmiCategory,
      bmr,
      tdee,
      targetCalories,
      macros,
      dietPlan,
      notes,
      id: savedDiet._id,
    });
  } catch (error) {
    console.error("generateDiet error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.generateDietWithAI = async (req, res) => {
  try {
    const {
      name,
      age,
      weight,
      height,
      gender,
      fitnessLevel,
      activityLevel,
      goal,
      injuries,
      medicalConditions,
      dietaryRestrictions,
      preferredFoods,
      dislikedFoods,
    } = req.body;

    const userId = String(req.user?.id || "");

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (
      !name ||
      !age ||
      !weight ||
      !height ||
      !gender ||
      !fitnessLevel ||
      !activityLevel ||
      !goal
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const ageNum = Number(age);
    const weightNum = Number(weight);
    const heightNum = Number(height);

    if (ageNum <= 0 || weightNum <= 0 || heightNum <= 0) {
      return res.status(400).json({
        message: "Age, weight, and height must be positive values",
      });
    }

    const bmi = Number((weightNum / ((heightNum / 100) ** 2)).toFixed(1));
    const bmiCategory = getBmiCategory(bmi);
    const bmr = calculateBMR({
      weight: weightNum,
      height: heightNum,
      age: ageNum,
      gender,
    });

    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
    const tdee = Math.round(bmr * multiplier);
    const goalSettings = GOAL_CONFIG[goal] || GOAL_CONFIG["general fitness"];
    const targetCalories = Math.max(1200, tdee + goalSettings.calorieAdjustment);
    const macros = calculateMacros({
      targetCalories,
      weight: weightNum,
      goal,
    });

    const flags = buildFlags({
      injuries,
      medicalConditions,
      dietaryRestrictions,
    });

    const profile = {
      name,
      age: ageNum,
      weight: weightNum,
      height: heightNum,
      gender,
      fitnessLevel,
      activityLevel,
      goal,
      injuries,
      medicalConditions,
      dietaryRestrictions,
      preferredFoods,
      dislikedFoods,
    };

    const metrics = {
      bmi,
      bmiCategory,
      bmr,
      tdee,
      targetCalories,
      macros,
    };

    let aiUsed = true;
    let aiResult;

    try {
      aiResult = await generateAIDietPlan({
        profile,
        metrics,
      });
    } catch (aiError) {
      console.error("AI generate failed, falling back:", aiError.message);
      aiUsed = false;

      aiResult = {
        assistantMessage:
          "AI is currently unavailable, so I generated a smart fallback nutrition plan for you.",
        dietPlan: buildFallbackDietPlan({
          goal,
          targetCalories,
          flags,
          preferredFoods,
          dislikedFoods,
        }),
        notes: [],
      };
    }

    const notes =
      Array.isArray(aiResult.notes) && aiResult.notes.length > 0
        ? aiResult.notes
        : buildNotes({
            bmiCategory,
            medicalConditions,
            injuries,
            dietaryRestrictions,
            preferredFoods,
            dislikedFoods,
            flags,
            aiUsed,
          });

    const savedDiet = await Diet.create({
      user_id: userId,
      name,
      age: ageNum,
      weight: weightNum,
      height: heightNum,
      gender,
      fitnessLevel,
      activityLevel,
      goal,
      injuries,
      medicalConditions,
      dietaryRestrictions,
      preferredFoods,
      dislikedFoods,
      bmi,
      bmiCategory,
      bmr,
      tdee,
      targetCalories,
      macros,
      plan: aiResult.dietPlan,
      notes,
    });

    return res.json({
      message: aiUsed
        ? "AI diet plan generated successfully"
        : "Fallback diet plan generated successfully",
      bmi,
      bmiCategory,
      bmr,
      tdee,
      targetCalories,
      macros,
      assistantMessage: aiResult.assistantMessage,
      dietPlan: aiResult.dietPlan,
      notes,
      id: savedDiet._id,
    });
  } catch (error) {
    console.error("generateDietWithAI error:", error);
    return res.status(500).json({
      message: "AI generation failed",
      error: error.message,
    });
  }
};

exports.reviseDietWithAI = async (req, res) => {
  try {
    const userId = String(req.user?.id || "");

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      profile,
      metrics,
      currentPlan,
      currentNotes,
      userInstruction,
    } = req.body;

    if (!profile || !metrics || !Array.isArray(currentPlan) || !userInstruction?.trim()) {
      return res.status(400).json({
        message: "profile, metrics, currentPlan, and userInstruction are required",
      });
    }

    let aiResult;

    try {
      aiResult = await reviseAIDietPlan({
        profile,
        metrics,
        currentPlan,
        currentNotes,
        userInstruction,
      });
    } catch (aiError) {
      console.error("AI revise failed:", aiError.message);
      aiResult = {
        assistantMessage:
          "I could not revise the plan with AI right now, so I kept your current plan unchanged.",
        dietPlan: currentPlan,
        notes: Array.isArray(currentNotes) ? currentNotes : [],
      };
    }

    return res.json({
      message: "Diet plan updated successfully",
      assistantMessage: aiResult.assistantMessage,
      dietPlan: aiResult.dietPlan,
      notes: aiResult.notes,
    });
  } catch (error) {
    console.error("reviseDietWithAI error:", error);
    return res.status(500).json({
      message: "AI revision failed",
      error: error.message,
    });
  }
};

exports.getDietPlans = async (req, res) => {
  try {
    const userId = String(req.user?.id || "");

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const plans = await Diet.find({ user_id: userId }).sort({ createdAt: -1 });

    return res.json(
      plans.map((doc) => ({
        id: doc._id,
        goal: doc.goal,
        name: doc.name,
        age: doc.age,
        weight: doc.weight,
        height: doc.height,
        gender: doc.gender,
        fitnessLevel: doc.fitnessLevel,
        activityLevel: doc.activityLevel,
        injuries: doc.injuries,
        medicalConditions: doc.medicalConditions,
        dietaryRestrictions: doc.dietaryRestrictions,
        preferredFoods: doc.preferredFoods,
        dislikedFoods: doc.dislikedFoods,
        bmi: doc.bmi,
        bmiCategory: doc.bmiCategory,
        bmr: doc.bmr,
        tdee: doc.tdee,
        targetCalories: doc.targetCalories,
        macros: doc.macros,
        plan: doc.plan,
        notes: doc.notes,
        created_at: doc.createdAt,
      }))
    );
  } catch (error) {
    console.error("getDietPlans error:", error);
    return res.status(500).json({
      message: "DB error",
      error: error.message,
    });
  }
};

exports.createDietPlan = async (req, res) => {
  try {
    const userId = String(req.user?.id || "");

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { goal, planData } = req.body;

    if (!planData || !Array.isArray(planData)) {
      return res.status(400).json({
        message: "Valid planData array is required",
      });
    }

    const savedDiet = await Diet.create({
      user_id: userId,
      goal: goal || "custom",
      plan: planData,
    });

    return res.json({
      message: "Diet plan saved successfully",
      id: savedDiet._id,
    });
  } catch (error) {
    console.error("createDietPlan error:", error);
    return res.status(500).json({
      message: "DB error",
      error: error.message,
    });
  }
};