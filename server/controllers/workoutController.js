const Workout = require("../models/Workout");


const generateStaticWorkout = (goal) => {
  if (goal === "Lose Weight") {
    return ["Jumping Jacks - 3 sets", "Walking - 30 min", "Plank - 30 sec"];
  }

  if (goal === "Gain Muscle") {
    return ["Push-ups - 15 reps", "Dumbbell Squats - 12 reps", "Plank - 45 sec"];
  }

  return ["Stretching - 10 min", "Bodyweight Squats - 15 reps", "Walking - 15 min"];
};

const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    return res.json(workouts);
  } catch (error) {
    return res.status(500).json({ message: "Database error" });
  }
};

const createWorkout = async (req, res) => {
  try {
    const { age, weight, height, activity, goal, diet, workoutPlan } = req.body;

    if (!age || !weight || !height || !activity || !goal) {
      return res.status(400).json({
        message: "Age, weight, height, activity, and goal are required",
      });
    }

    const workout = await Workout.create({
      user: req.user.id,
      age,
      weight,
      height,
      activity,
      goal,
      diet,
      plan: workoutPlan || generateStaticWorkout(goal),
    });

    return res.status(201).json({
      message: "Workout created successfully",
      workout,
    });
  } catch (error) {
    return res.status(500).json({ message: "Insert error" });
  }
};

const generateWorkout = async (req, res) => {
  try {
    const { age, weight, height, activity, goal, diet } = req.body;

    if (!age || !weight || !height || !activity || !goal) {
      return res.status(400).json({
        message: "Age, weight, height, activity, and goal are required",
      });
    }

    const API_KEY = process.env.OPENROUTER_API_KEY;
    let workoutPlan = null;

    const models = [
      "google/gemini-2.0-flash-001",
      "meta-llama/llama-3.1-8b-instruct",
      "mistralai/mistral-7b-instruct:free",
      "google/gemini-flash-1.5",
    ];

    if (API_KEY) {
      for (const modelName of models) {
        try {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "http://localhost:3000",
              "X-Title": "12FIT App",
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                {
                  role: "system",
                  content:
                    "You are a professional fitness coach. Return only a JSON array of workout exercises with reps. No extra text.",
                },
                {
                  role: "user",
                  content: `Create a personalized workout plan for: age ${age}, weight ${weight}kg, height ${height}cm, activity ${activity}, goal ${goal}. Notes: ${diet || "none"}. Return only JSON array like ["Exercise - reps"].`,
                },
              ],
            }),
          });

          const data = await response.json();

          if (data.error) {
            continue;
          }

          const aiText = data.choices?.[0]?.message?.content;

          if (!aiText) {
            continue;
          }

          const jsonMatch = aiText.match(/\[.*\]/s);

          if (jsonMatch) {
            try {
              workoutPlan = JSON.parse(jsonMatch[0]);
            } catch (error) {
              workoutPlan = null;
            }
          }

          if (Array.isArray(workoutPlan) && workoutPlan.length > 0) {
            break;
          }
        } catch (error) {
          continue;
        }
      }
    }

    if (!workoutPlan) {
      workoutPlan = generateStaticWorkout(goal);
    }

    const workout = await Workout.create({
  user: req.user.id,
  age,
  weight,
  height,
  activity,
  goal,
  diet,
  plan: workoutPlan,
});

    return res.status(201).json({
  message: "Workout generated successfully",
  workout,
  workoutPlan: workout.plan,
});

  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      req.body,
      { new: true }
    );

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    return res.json({
      message: "Workout updated successfully",
      workout,
    });
  } catch (error) {
    return res.status(500).json({ message: "Update error" });
  }
};

const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    return res.json({
      message: "Workout deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Delete error" });
  }
};

module.exports = {
  getWorkouts,
  createWorkout,
  generateWorkout,
  updateWorkout,
  deleteWorkout,
};
