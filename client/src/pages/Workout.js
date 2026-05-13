import { useState } from "react";
import { generateWorkout } from "../services/workoutService";

function Workout() {
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    activity: "Moderate",
    goal: "Lose Weight",
    diet: "",
  });

  const [result, setResult] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const data = await generateWorkout(formData);
      const plan = data.workoutPlan || data.data?.workoutPlan || [];
      setResult(plan);
      
      if (plan.length === 0) {
        setMessage("Connection successful but no data received.");
      } else {
        setMessage("Plan generated successfully");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error connecting to server. ");
    } finally {
      setLoading(false);
    }
  };

  const renderExercise = (step) => {
    if (typeof step === 'string') {
      return step;
    }
    if (typeof step === 'object' && step !== null) {
      return Object.entries(step)
        .map(([key, value]) => `${key}: ${value}`)
        .join(" - ");
    }
    return "Unknown exercise";
  };

  return (
    <div className="container py-5">
      <div className="card p-4 shadow-sm border-0 mx-auto" style={{ maxWidth: "500px" }}>
        <h4 className="text-center mb-4 text-primary">12FIT AI Generator</h4>
        
        <form onSubmit={handleGenerate}>
          <div className="mb-3">
            <label className="form-label">Age</label>
            <input type="number" name="age" className="form-control" onChange={handleChange} value={formData.age} required placeholder="Example: 25" />
          </div>

          <div className="mb-3">
            <label className="form-label">Weight (kg)</label>
            <input type="number" name="weight" className="form-control" onChange={handleChange} value={formData.weight} required placeholder="Example: 80" />
          </div>

          <div className="mb-3">
            <label className="form-label">Height (cm)</label>
            <input type="number" name="height" className="form-control" onChange={handleChange} value={formData.height} required placeholder="Example: 180" />
          </div>

          <div className="mb-3">
            <label className="form-label">Activity Level</label>
            <select name="activity" className="form-control" onChange={handleChange} value={formData.activity}>
              <option value="Sedentary">Sedentary (No Exercise)</option>
              <option value="Moderate">Moderate (Light Exercise)</option>
              <option value="Active">Active (Heavy Exercise)</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Goal</label>
            <select name="goal" className="form-control" onChange={handleChange} value={formData.goal}>
              <option value="Lose Weight">Lose Weight</option>
              <option value="Gain Muscle">Gain Muscle</option>
              <option value="Maintain">Maintain Fitness</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label">Additional Notes (Optional)</label>
            <textarea name="diet" className="form-control" rows="2" onChange={handleChange} value={formData.diet} placeholder="Any injuries or dietary needs..."></textarea>
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Generating..." : "Generate Plan"}
          </button>
        </form>
      </div>

      {message && (
        <div className={`alert ${result.length > 0 ? 'alert-success' : 'alert-danger'} mt-4 text-center mx-auto`} style={{ maxWidth: "500px" }}>
          {message}
        </div>
      )}

      {result.length > 0 && (
        <div className="card p-4 shadow-sm border-0 mt-4 mx-auto" style={{ maxWidth: "500px" }}>
          <h5 className="mb-4 text-center text-primary">Your Workout Plan</h5>
          <div className="list-group">
            {result.map((step, index) => (
              <div key={index} className="list-group-item border-0 mb-1 rounded bg-light">
                <span>{index + 1}. </span> 
                <span>{renderExercise(step)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Workout;
