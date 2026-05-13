
const createWorkout = async (req, res) => {
  try {
    const { age, weight, height, activity, goal, diet } = req.body;
    const API_KEY = process.env.OPENROUTER_API_KEY;
    if (!API_KEY) {
      console.error(" خطأ: API_KEY");
    }
    let workoutPlan = null;

const models = [
  "google/gemini-2.0-flash-001",
  "meta-llama/llama-3.1-8b-instruct",
  "mistralai/mistral-7b-instruct:free",
  "google/gemini-flash-1.5"
];

    for (let modelName of models) {
      try {
        console.log(` جاري الاتصال بـ OpenRouter باستخدام: ${modelName}...`);
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000", 
            "X-Title": "12FIT App"
          },
          body: JSON.stringify({
            "model": modelName,
            "messages": [
              {
                "role": "system",
                "content": "أنت مدرب لياقة محترف. أجب دائماً بمصفوفة JSON فقط تحتوي على أسماء التمارين مع العدات بدون أي نص إضافي."
              },
              {
                "role": "user",
                "content": `صمم جدول تمارين مخصص جداً وفريد لشخص: العمر ${age}، الوزن ${weight}kg، الطول ${height}cm، النشاط ${activity}، الهدف ${goal}. الملاحظات: ${diet || 'لا يوجد'}.
                يجب أن تكون التمارين متنوعة. أعطني النتيجة كمصفوفة JSON فقط مثل: ["تمرين - عدات"]`
              }
            ]
          })
        });

        const data = await response.json();

      
        if (data.error) {
          console.error(` رد من OpenRouter (${modelName}):`, data.error.message || data.error);
          continue; 
        }

        if (data.choices && data.choices[0]) {
          const aiText = data.choices[0].message.content;
          console.log(`📥 الرد المستلم من ${modelName}:`, aiText);
          const jsonMatch = aiText.match(/\[.*\]/s);
          workoutPlan = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

          if (workoutPlan) {
            console.log(` نجح التوليد  بواسطة: ${modelName}`);
            break; 
          }
        }
      } catch (err) {
        console.error(` فشل الاتصال بالموديل ${modelName}:`, err.message);
      }
    }

    // إذا فشلت كل المحاولات أو كان المفتاح Limit Exceeded
    if (!workoutPlan) {
      console.log(" فشلت  AI.   استخدام الخطة البديلة الثابتة.");
      workoutPlan = generateStaticWorkout(goal, activity);
    }

    res.json({
      message: workoutPlan ? "تم التوليد بنجاح" : "تم استخدام الخطة البديلة",
      age, weight, height, activity, goal, diet,
      workoutPlan
    });

  } catch (error) {
    console.error("Critical Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const generateStaticWorkout = (goal, activity) => {
  // خطة الطوارئ في حال تعطل الـ API
  if (goal === "Lose Weight") {
    return ["Jumping Jacks - 3 sets", "Walking - 30 min", "Plank - 30 sec"];
  }
  if (goal === "Gain Muscle") {
    return ["Push-ups - 15 reps", "Dumbbell Squats - 12 reps", "Plank - 45 sec"];
  }
  return ["Stretching - 10 min", "Bodyweight Squats - 15 reps", "Walking - 15 min"];
};

module.exports = {
  getWorkouts: (req, res) => res.json({ message: "Workout API is active" }),
  createWorkout,
  generateWorkout: createWorkout 
};
