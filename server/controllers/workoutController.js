const Workout = require("../models/Workout");

const generateStaticWorkout = (goal, activity) => {
  if (goal === "Lose Weight") {
    return ["Jumping Jacks - 3 sets", "Walking - 30 min", "Plank - 30 sec"];
  }

  if (goal === "Gain Muscle") {
    return ["Push-ups - 15 reps", "Dumbbell Squats - 12 reps", "Plank - 45 sec"];
  }

  return ["Stretching - 10 min", "Bodyweight Squats - 15 reps", "Walking - 15 min"];
};

const normalizeWorkoutPlan = (plan) => {
  if (!Array.isArray(plan)) {
    return [];
  }

  return plan.map((item) => {
    if (typeof item === "string") {
      return item;
    }

    if (typeof item === "object" && item !== null) {
      const exercise =
        item["اسم التمرين"] ||
        item.exercise ||
        item.name ||
        item.workout ||
        "Exercise";

      const reps =
        item["العدات"] ||
        item.reps ||
        item.sets ||
        item.duration ||
        "";

      return reps ? `${exercise} - ${reps}` : exercise;
    }

    return String(item);
  });
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
      "google/gemini-1.5-flash",
    ];

    if (API_KEY) {
      for (let modelName of models) {
        try {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:3000",
              "X-Title": "12FIT App",
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                {
                  role: "system",
                  content:
                    "أنت مدرب لياقة محترف. أجب دائماً بمصفوفة JSON فقط تحتوي على أسماء التمارين مع العدات بدون أي نص إضافي.",
                },
                {
                  role: "user",
                  content: `صمم جدول تمارين مخصص جداً وفريد لشخص: العمر ${age}، الوزن ${weight}kg، الطول ${height}cm، النشاط ${activity}، الهدف ${goal}. الملاحظات: ${diet || "لا يوجد"}.
                  يجب أن تكون التمارين متنوعة. أعطني النتيجة كمصفوفة JSON فقط مثل: ["تمرين - عدات"]`,
                },
              ],
            }),
          });

          const data = await response.json();

          if (data.error) {
            continue;
          }

          if (data.choices && data.choices[0]) {
            const aiText = data.choices[0].message.content;
            const jsonMatch = aiText.match(/\[.*\]/s);

            if (jsonMatch) {
              try {
                workoutPlan = JSON.parse(jsonMatch[0]);
              } catch (error) {
                workoutPlan = null;
              }
            }

            if (workoutPlan) {
              break;
            }
          }
        } catch (err) {
          continue;
        }
      }
    }

    if (!workoutPlan) {
      workoutPlan = generateStaticWorkout(goal, activity);
    }

    workoutPlan = normalizeWorkoutPlan(workoutPlan);

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
      message: "تم التوليد بنجاح",
      age,
      weight,
      height,
      activity,
      goal,
      diet,
      workoutPlan,
      workout,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
    });
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
  generateWorkout: createWorkout,
  updateWorkout,
  deleteWorkout,
};
