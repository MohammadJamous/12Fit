import { useState } from "react";
import { createWorkout } from "../services/workoutService";

function Workout() {
  const token = localStorage.getItem("token");

  const [goal, setGoal] = useState("lose weight");
  const [level, setLevel] = useState("beginner");
  const [result, setResult] = useState([]);
  const [message, setMessage] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();

    try {
      const res = await createWorkout({ goal, level }, token);
      setResult(res.data.workoutPlan);
      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <div className="container py-5">
        <h2 className="mb-4">Workout Generator</h2>

        <form onSubmit={handleGenerate} className="card p-4 shadow-sm border-0 mb-4">
          <div className="mb-3">
            <label className="form-label">Goal</label>
            <select
              className="form-control"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            >
              <option value="lose weight">Lose Weight</option>
              <option value="muscle gain">Muscle Gain</option>
              <option value="general fitness">General Fitness</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Level</label>
            <select
              className="form-control"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
            </select>
          </div>

          <button className="btn btn-primary">Generate Workout</button>
        </form>

        {message && <div className="alert alert-info">{message}</div>}

        {result.length > 0 && (
          <div className="card p-4 shadow-sm border-0">
            <h4 className="mb-3">Your Workout Plan</h4>
            <ul className="mb-0">
              {result.map((item, index) => (
                <li key={index} className="mb-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

export default Workout;