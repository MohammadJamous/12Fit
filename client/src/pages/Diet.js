import { useEffect, useMemo, useState } from "react";
import { generateDietAI, reviseDietAI } from "../services/dietService";

const initialFormData = {
  name: "",
  age: "",
  weight: "",
  height: "",
  gender: "",
  fitnessLevel: "",
  activityLevel: "",
  goal: "",
  injuries: "",
  medicalConditions: "",
  dietaryRestrictions: "",
  preferredFoods: "",
  dislikedFoods: "",
};

function Diet() {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [userInstruction, setUserInstruction] = useState("");
  const [revising, setRevising] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    if (result) {
      window.scrollTo({ top: 650, behavior: "smooth" });
    }
  }, [result]);

  const planArray = useMemo(
    () => (Array.isArray(result?.dietPlan) ? result.dietPlan : []),
    [result]
  );

  const notesArray = useMemo(
    () => (Array.isArray(result?.notes) ? result.notes : []),
    [result]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["age"].includes(name) && value !== "" && !/^\d+$/.test(value)) return;
    if (["weight", "height"].includes(name) && value !== "" && !/^\d*\.?\d*$/.test(value)) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!token) newErrors.auth = "Please login first";
    if (!formData.name.trim()) newErrors.name = "Enter your full name";
    if (!formData.age || Number(formData.age) <= 0) newErrors.age = "Enter a valid age";
    if (!formData.weight || Number(formData.weight) <= 0) newErrors.weight = "Enter a valid weight";
    if (!formData.height || Number(formData.height) <= 0) newErrors.height = "Enter a valid height";
    if (!formData.gender) newErrors.gender = "Select gender";
    if (!formData.fitnessLevel) newErrors.fitnessLevel = "Select fitness level";
    if (!formData.activityLevel) newErrors.activityLevel = "Select activity level";
    if (!formData.goal) newErrors.goal = "Select your goal";

    setErrors(newErrors);

    if (newErrors.auth) {
      setMessage(newErrors.auth);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage("");
    setResult(null);
    setChatHistory([]);
    setUserInstruction("");

    try {
      const data = await generateDietAI(formData, token);

      setResult(data);
      setMessage(data.message || "Diet plan generated successfully");

      if (data.assistantMessage) {
        setChatHistory([
          {
            role: "assistant",
            content: data.assistantMessage,
          },
        ]);
      }
    } catch (error) {
      console.error("AI Generate Error:", error.response?.data || error.message);
      setMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Server error while generating the AI diet plan"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRevisePlan = async () => {
    if (!result || !userInstruction.trim() || !token) return;

    setRevising(true);
    setMessage("");

    try {
      const data = await reviseDietAI(
        {
          profile: formData,
          metrics: {
            bmi: result?.bmi,
            bmiCategory: result?.bmiCategory,
            bmr: result?.bmr,
            tdee: result?.tdee,
            targetCalories: result?.targetCalories,
            macros: result?.macros,
          },
          currentPlan: result?.dietPlan || [],
          currentNotes: result?.notes || [],
          userInstruction,
        },
        token
      );

      setResult((prev) => ({
        ...prev,
        dietPlan: Array.isArray(data.dietPlan) ? data.dietPlan : prev?.dietPlan || [],
        notes: Array.isArray(data.notes) ? data.notes : prev?.notes || [],
        assistantMessage: data.assistantMessage || "",
      }));

      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: userInstruction },
        {
          role: "assistant",
          content: data.assistantMessage || "Your plan was updated.",
        },
      ]);

      setUserInstruction("");
      setMessage(data.message || "Diet plan updated successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update the diet plan");
    } finally {
      setRevising(false);
    }
  };

  return (
    <>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="bg-success text-white p-4">
                <h2 className="mb-1 fw-bold">AI Diet Generator</h2>
                <p className="mb-0">
                  Build a personalized nutrition plan using your body data, activity level, goals, and health notes.
                </p>
              </div>

              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`form-control ${errors.name ? "is-invalid" : ""}`}
                        placeholder="Enter your full name"
                      />
                      {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label fw-semibold">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className={`form-control ${errors.age ? "is-invalid" : ""}`}
                        placeholder="22"
                      />
                      {errors.age && <div className="invalid-feedback">{errors.age}</div>}
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label fw-semibold">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={`form-select ${errors.gender ? "is-invalid" : ""}`}
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        className={`form-control ${errors.weight ? "is-invalid" : ""}`}
                        placeholder="70"
                      />
                      {errors.weight && <div className="invalid-feedback">{errors.weight}</div>}
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">Height (cm)</label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        className={`form-control ${errors.height ? "is-invalid" : ""}`}
                        placeholder="175"
                      />
                      {errors.height && <div className="invalid-feedback">{errors.height}</div>}
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">Fitness Level</label>
                      <select
                        name="fitnessLevel"
                        value={formData.fitnessLevel}
                        onChange={handleChange}
                        className={`form-select ${errors.fitnessLevel ? "is-invalid" : ""}`}
                      >
                        <option value="">Select</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                      {errors.fitnessLevel && (
                        <div className="invalid-feedback">{errors.fitnessLevel}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Daily Activity Level</label>
                      <select
                        name="activityLevel"
                        value={formData.activityLevel}
                        onChange={handleChange}
                        className={`form-select ${errors.activityLevel ? "is-invalid" : ""}`}
                      >
                        <option value="">Select</option>
                        <option value="sedentary">Sedentary</option>
                        <option value="light">Lightly Active</option>
                        <option value="moderate">Moderately Active</option>
                        <option value="active">Active</option>
                        <option value="very_active">Very Active</option>
                      </select>
                      {errors.activityLevel && (
                        <div className="invalid-feedback">{errors.activityLevel}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Goal</label>
                      <select
                        name="goal"
                        value={formData.goal}
                        onChange={handleChange}
                        className={`form-select ${errors.goal ? "is-invalid" : ""}`}
                      >
                        <option value="">Select your goal</option>
                        <option value="lose weight">🔥 Lose Weight</option>
                        <option value="muscle gain">💪 Muscle Gain</option>
                        <option value="weight gain">🍽️ Weight Gain</option>
                        <option value="general fitness">⚡ General Fitness</option>
                      </select>
                      {errors.goal && <div className="invalid-feedback">{errors.goal}</div>}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Medical Conditions</label>
                      <textarea
                        name="medicalConditions"
                        value={formData.medicalConditions}
                        onChange={handleChange}
                        className="form-control"
                        rows="3"
                        placeholder="Example: diabetes, high blood pressure, lactose intolerance"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Injuries / Health Notes</label>
                      <textarea
                        name="injuries"
                        value={formData.injuries}
                        onChange={handleChange}
                        className="form-control"
                        rows="3"
                        placeholder="Example: knee injury, back pain, stomach sensitivity"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Dietary Restrictions</label>
                      <textarea
                        name="dietaryRestrictions"
                        value={formData.dietaryRestrictions}
                        onChange={handleChange}
                        className="form-control"
                        rows="3"
                        placeholder="Example: vegetarian, gluten-free, no seafood"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Preferred Foods</label>
                      <input
                        type="text"
                        name="preferredFoods"
                        value={formData.preferredFoods}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Example: chicken, rice, oats, yogurt"
                      />
                    </div>

                    <div className="col-12 mb-4">
                      <label className="form-label fw-semibold">Disliked Foods</label>
                      <input
                        type="text"
                        name="dislikedFoods"
                        value={formData.dislikedFoods}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Example: tuna, broccoli, eggs"
                      />
                    </div>
                  </div>

                  {errors.auth && (
                    <div className="alert alert-warning text-center">{errors.auth}</div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-success w-100 py-3 fw-bold rounded-3"
                    disabled={loading}
                  >
                    {loading ? "Generating your AI plan..." : "Generate My AI Nutrition Plan"}
                  </button>
                </form>
              </div>
            </div>

            {message && (
              <div className="alert alert-info mt-4 text-center shadow-sm">
                {message}
              </div>
            )}

            {result && (
              <div className="mt-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 rounded-4">
                      <div className="card-body text-center">
                        <h6 className="text-muted">BMI</h6>
                        <h3 className="fw-bold">{result.bmi ?? "-"}</h3>
                        <small>{result.bmiCategory || ""}</small>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 rounded-4">
                      <div className="card-body text-center">
                        <h6 className="text-muted">BMR</h6>
                        <h3 className="fw-bold">{result.bmr ?? "-"}</h3>
                        <small>kcal/day</small>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 rounded-4">
                      <div className="card-body text-center">
                        <h6 className="text-muted">TDEE</h6>
                        <h3 className="fw-bold">{result.tdee ?? "-"}</h3>
                        <small>kcal/day</small>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 rounded-4 bg-success text-white">
                      <div className="card-body text-center">
                        <h6>Target Calories</h6>
                        <h3 className="fw-bold">{result.targetCalories ?? "-"}</h3>
                        <small>kcal/day</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body">
                    <h4 className="mb-3">Recommended Macros</h4>
                    <div className="row text-center">
                      <div className="col-md-4 mb-3 mb-md-0">
                        <div className="p-3 bg-light rounded-3 text-dark">
                          <h6 className="text-secondary mb-2">Protein</h6>
                          <h4 className="fw-bold text-dark mb-0">{result.macros?.protein || "-"}</h4>
                        </div>
                      </div>

                      <div className="col-md-4 mb-3 mb-md-0">
                        <div className="p-3 bg-light rounded-3 text-dark">
                          <h6 className="text-secondary mb-2">Carbs</h6>
                          <h4 className="fw-bold text-dark mb-0">{result.macros?.carbs || "-"}</h4>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded-3 text-dark">
                          <h6 className="text-secondary mb-2">Fats</h6>
                          <h4 className="fw-bold text-dark mb-0">{result.macros?.fats || "-"}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body">
                    <h4 className="mb-3">Your Daily Diet Plan</h4>
                    <div className="row g-3">
                      {planArray.map((meal, index) => {
                        const isObjectMeal = typeof meal === "object" && meal !== null;
                        const mealTitle = isObjectMeal ? meal.meal || `Meal ${index + 1}` : `Meal ${index + 1}`;
                        const items = isObjectMeal && Array.isArray(meal.items) ? meal.items : [String(meal)];
                        const calories = isObjectMeal ? meal.calories : null;

                        return (
                          <div key={index} className="col-md-6">
                            <div className="border rounded-4 p-3 h-100">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h5 className="mb-0">{mealTitle}</h5>
                                {calories ? (
                                  <span className="badge text-bg-success">{calories} kcal</span>
                                ) : null}
                              </div>

                              <ul className="mb-0 ps-3">
                                {items.map((item, itemIndex) => (
                                  <li key={itemIndex}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {notesArray.length > 0 && (
                  <div className="card border-0 shadow-sm rounded-4 mb-4">
                    <div className="card-body">
                      <h4 className="mb-3">Smart Notes</h4>
                      <ul className="mb-0">
                        {notesArray.map((note, index) => (
                          <li key={index} className="mb-2">
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-body">
                    <h4 className="mb-3">Talk to the Nutrition Assistant</h4>

                    {chatHistory.length > 0 && (
                      <div
                        className="border rounded-3 p-3 mb-3 bg-light text-dark"
                        style={{ maxHeight: "320px", overflowY: "auto" }}
                      >
                        {chatHistory.map((msg, index) => (
                          <div
                            key={index}
                            className={`mb-3 d-flex ${
                              msg.role === "user" ? "justify-content-end" : "justify-content-start"
                            }`}
                          >
                            <div
                              className={`p-3 rounded-3 ${
                                msg.role === "user"
                                  ? "bg-success text-white"
                                  : "bg-white border text-dark"
                              }`}
                              style={{ maxWidth: "85%" }}
                            >
                              <div className="small fw-bold mb-1">
                                {msg.role === "user" ? "You" : "Assistant"}
                              </div>
                              <div>{msg.content}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <textarea
                      className="form-control mb-3 text-dark"
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#212529",
                        borderColor: "#ced4da",
                      }}
                      rows="3"
                      value={userInstruction}
                      onChange={(e) => setUserInstruction(e.target.value)}
                      placeholder="Example: Replace tuna with chicken, lower calories a bit, make the plan vegetarian, avoid dairy..."
                    />

                    <button
                      type="button"
                      className="btn btn-outline-success"
                      onClick={handleRevisePlan}
                      disabled={revising || !result || !userInstruction.trim()}
                    >
                      {revising ? "Updating plan..." : "Update My Plan"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Diet;