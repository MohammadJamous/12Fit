const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
console.log("GEMINI_MODEL:", process.env.GEMINI_MODEL);

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      const sliced = text.slice(firstBrace, lastBrace + 1);
      return JSON.parse(sliced);
    }
    throw error;
  }
};

const normalizeDietPlan = (dietPlan) => {
  if (!Array.isArray(dietPlan)) return [];

  return dietPlan.map((meal, index) => {
    if (typeof meal === "string") {
      return {
        meal: `Meal ${index + 1}`,
        calories: 0,
        items: [meal],
      };
    }

    return {
      meal: typeof meal?.meal === "string" ? meal.meal : `Meal ${index + 1}`,
      calories: Number(meal?.calories) || 0,
      items: Array.isArray(meal?.items)
        ? meal.items.map((item) => String(item))
        : [],
    };
  });
};

const normalizeResponse = (parsed) => {
  return {
    assistantMessage:
      typeof parsed?.assistantMessage === "string"
        ? parsed.assistantMessage
        : "Here is your updated nutrition plan.",
    dietPlan: normalizeDietPlan(parsed?.dietPlan),
    notes: Array.isArray(parsed?.notes)
      ? parsed.notes.map((note) => String(note))
      : [],
  };
};

const DIET_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    assistantMessage: {
      type: "string",
    },
    dietPlan: {
      type: "array",
      items: {
        type: "object",
        properties: {
          meal: { type: "string" },
          calories: { type: "number" },
          items: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["meal", "calories", "items"],
      },
    },
    notes: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["assistantMessage", "dietPlan", "notes"],
};

const buildPrompt = ({
  mode,
  profile,
  metrics,
  currentPlan,
  currentNotes,
  userInstruction,
}) => {
  return `
You are the AI nutrition assistant for a university project called 12Fit.

Important rules:
- Return JSON only.
- Do not diagnose diseases.
- Do not prescribe medicine.
- Give general wellness nutrition guidance only.
- Respect medical conditions, injuries, dietary restrictions, preferred foods, and disliked foods.
- Keep the plan practical, realistic, and beginner-friendly.
- Use the given calories and constraints.
- Each meal must contain:
  meal, calories, items[]
- The sum of meal calories should be approximately close to targetCalories.

Mode:
${mode}

Profile:
${JSON.stringify(profile, null, 2)}

Metrics:
${JSON.stringify(metrics, null, 2)}

Current plan:
${JSON.stringify(currentPlan || [], null, 2)}

Current notes:
${JSON.stringify(currentNotes || [], null, 2)}

User instruction:
${userInstruction || "Generate a personalized daily diet plan."}

Return JSON in this exact structure:
{
  "assistantMessage": "short helpful reply to the user",
  "dietPlan": [
    {
      "meal": "Breakfast",
      "calories": 450,
      "items": ["item 1", "item 2", "item 3"]
    },
    {
      "meal": "Snack 1",
      "calories": 180,
      "items": ["item 1", "item 2"]
    },
    {
      "meal": "Lunch",
      "calories": 600,
      "items": ["item 1", "item 2", "item 3"]
    },
    {
      "meal": "Snack 2",
      "calories": 180,
      "items": ["item 1", "item 2"]
    },
    {
      "meal": "Dinner",
      "calories": 500,
      "items": ["item 1", "item 2", "item 3"]
    }
  ],
  "notes": [
    "note 1",
    "note 2",
    "note 3"
  ]
}
`;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createStructuredCompletion = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const maxRetries = 3;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: DIET_RESPONSE_SCHEMA,
          temperature: 0.7,
        },
      });

      const text = response.text || "{}";
      const parsed = safeJsonParse(text);

      return normalizeResponse(parsed);
    } catch (error) {
      lastError = error;

      const status = error?.status;
      const isRetryable = status === 503 || status === 429;

      console.error(`Gemini attempt ${attempt} failed:`, error.message);

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      await wait(attempt * 2000);
    }
  }

  throw lastError;
};

exports.generateAIDietPlan = async ({ profile, metrics }) => {
  const prompt = buildPrompt({
    mode: "generate",
    profile,
    metrics,
    currentPlan: [],
    currentNotes: [],
    userInstruction: "Generate a new personalized daily diet plan.",
  });

  return createStructuredCompletion(prompt);
};

exports.reviseAIDietPlan = async ({
  profile,
  metrics,
  currentPlan,
  currentNotes,
  userInstruction,
}) => {
  const prompt = buildPrompt({
    mode: "revise",
    profile,
    metrics,
    currentPlan,
    currentNotes,
    userInstruction,
  });

  return createStructuredCompletion(prompt);
};