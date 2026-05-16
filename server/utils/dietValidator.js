const Joi = require("joi");

const mealSchema = Joi.object({
  meal: Joi.string().required(),
  calories: Joi.number().required(),
  items: Joi.array().items(Joi.string()).required(),
});

const macrosSchema = Joi.object({
  protein: Joi.string().required(),
  carbs: Joi.string().required(),
  fats: Joi.string().required(),
});

const generateDietSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  age: Joi.number().min(10).max(100).required(),
  weight: Joi.number().min(20).max(300).required(),
  height: Joi.number().min(100).max(250).required(),
  gender: Joi.string().valid("male", "female").required(),
  fitnessLevel: Joi.string().valid("beginner", "intermediate", "advanced").required(),
  activityLevel: Joi.string()
    .valid("sedentary", "light", "moderate", "active", "very_active")
    .required(),
  goal: Joi.string()
    .valid("lose weight", "muscle gain", "weight gain", "general fitness")
    .required(),
  injuries: Joi.string().allow("").optional(),
  medicalConditions: Joi.string().allow("").optional(),
  dietaryRestrictions: Joi.string().allow("").optional(),
  preferredFoods: Joi.string().allow("").optional(),
  dislikedFoods: Joi.string().allow("").optional(),
});

const reviseDietSchema = Joi.object({
  dietId: Joi.string().required(),
  profile: generateDietSchema.required(),
  metrics: Joi.object({
    bmi: Joi.number().required(),
    bmiCategory: Joi.string().required(),
    bmr: Joi.number().required(),
    tdee: Joi.number().required(),
    targetCalories: Joi.number().required(),
    macros: macrosSchema.required(),
  }).required(),
  currentPlan: Joi.array().items(mealSchema).required(),
  currentNotes: Joi.array().items(Joi.string()).required(),
  userInstruction: Joi.string().min(3).required(),
});

const saveDietPlanSchema = Joi.object({
  goal: Joi.string().allow("").optional(),
  planData: Joi.array().items(mealSchema).min(1).required(),
});

module.exports = {
  generateDietSchema,
  reviseDietSchema,
  saveDietPlanSchema,
};
