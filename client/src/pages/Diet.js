import { useState } from "react";
import { getDietPlan } from "../services/dietService";

function Diet() {
  const token = localStorage.getItem("token");

  const [goal, setGoal] = useState("lose weight");
  const [result, setResult] = useState([]);
  const [message, setMessage] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();

    try {
      const res = await getDietPlan({ goal }, token);
      setResult(res.data.dietPlan);
      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <div className="container py-5">
        <h2 className="mb-4">Diet Generator</h2>

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

          <button className="btn btn-success">Generate Diet Plan</button>
        </form>

        {message && <div className="alert alert-info">{message}</div>}

        {result.length > 0 && (
          <div className="card p-4 shadow-sm border-0">
            <h4 className="mb-3">Your Diet Plan</h4>
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

export default Diet;