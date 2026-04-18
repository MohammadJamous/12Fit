import { useEffect, useState } from "react";
import { getProgress, addProgress } from "../services/progressService";

function Progress() {
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("");

  const [goal, setGoal] = useState(null);
  const [goalWeight, setGoalWeight] = useState("");
  const [goalDate, setGoalDate] = useState("");

  const [weight, setWeight] = useState("");
  const [chestMeasurement, setChestMeasurement] = useState("");
  const [waistMeasurement, setWaistMeasurement] = useState("");
  const [hipsMeasurement, setHipsMeasurement] = useState("");
  const [armsMeasurement, setArmsMeasurement] = useState("");
  const [bodyFatPercentage, setBodyFatPercentage] = useState("");
  const [notes, setNotes] = useState("");

  const loadProgress = async () => {
    try {
      const res = await getProgress();
      setProgressList(res.data);

      const savedGoal = localStorage.getItem("progressGoal");
      if (savedGoal) {
        setGoal(JSON.parse(savedGoal));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const calculateBMI = (weight, height) => {
    if (!height || !weight) return null;
    return (weight / (height * height)).toFixed(1);
  };

  const calculateGoalProgress = () => {
    if (!goal || progressList.length === 0) return null;

    const currentWeight = parseFloat(progressList[0].weight);
    const targetWeight = parseFloat(goal.targetWeight);
    const startWeight = parseFloat(progressList[progressList.length - 1].weight);

    const totalChange = startWeight - targetWeight;
    const currentChange = startWeight - currentWeight;
    const percentage = (currentChange / totalChange) * 100;

    return {
      currentWeight,
      targetWeight,
      startWeight,
      percentage: Math.min(100, Math.max(0, percentage)),
      remaining: Math.abs(targetWeight - currentWeight),
      isGoalReached: currentWeight <= targetWeight,
    };
  };

  const handleAddProgress = async (e) => {
    e.preventDefault();

    if (!weight) {
      setMessage("Please enter your weight");
      setMessageType("danger");
      return;
    }

    if (goalWeight && !goalDate) {
      setMessage("Please set a target date for your goal");
      setMessageType("danger");
      return;
    }

    if (goalDate && !goalWeight) {
      setMessage("Please set a target weight for your goal");
      setMessageType("danger");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (goalWeight && goalDate) {
        const newGoal = {
          targetWeight: parseFloat(goalWeight),
          targetDate: goalDate,
          createdAt: new Date().toISOString(),
        };
        setGoal(newGoal);
        localStorage.setItem("progressGoal", JSON.stringify(newGoal));
      }

      const progressData = {
        day_name: new Date().toLocaleDateString("en-US"),
        weight,
        chest: chestMeasurement || null,
        waist: waistMeasurement || null,
        hips: hipsMeasurement || null,
        arms: armsMeasurement || null,
        bodyFat: bodyFatPercentage || null,
        notes: notes || null,
      };

      await addProgress(progressData);
      setMessage("Progress added successfully");
      setMessageType("success");

      setWeight("");
      setChestMeasurement("");
      setWaistMeasurement("");
      setHipsMeasurement("");
      setArmsMeasurement("");
      setBodyFatPercentage("");
      setNotes("");
      setGoalWeight("");
      setGoalDate("");

      loadProgress();
    } catch (error) {
      setMessage("Failed to add progress: " + (error.response?.data?.message || "Something went wrong"));
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  const goalProgress = calculateGoalProgress();

  const calculateStats = () => {
    if (progressList.length < 2) return null;

    const weights = progressList.map((p) => parseFloat(p.weight)).sort((a, b) => a - b);
    const latestWeight = weights[0];
    const oldestWeight = weights[weights.length - 1];
    const avgWeight = weights.reduce((a, b) => a + b) / weights.length;
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const totalChange = oldestWeight - latestWeight;

    return {
      totalChange: totalChange.toFixed(1),
      avgWeight: avgWeight.toFixed(1),
      minWeight: minWeight.toFixed(1),
      maxWeight: maxWeight.toFixed(1),
      latestWeight: latestWeight.toFixed(1),
      entries: progressList.length,
    };
  };

  const stats = calculateStats();

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-white mb-3 admin-dashboard-title">Progress Tracker</h1>
        <p className="lead text-muted">Track your comprehensive fitness progress</p>
      </div>

      <div className="row justify-content-center g-4 mb-5">
        <div className="col-lg-8">
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "24px",
              padding: "40px",
              backdropFilter: "blur(18px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
            }}
          >
            <h3 className="text-white fw-bold mb-4 text-center">Progress Entry</h3>
            <p className="text-muted text-center mb-4">
              Set your goal here if you want, then add a progress entry with one button.
            </p>

            <form onSubmit={handleAddProgress}>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label text-light">Target Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control progress-input"
                    placeholder="Optional goal weight"
                    value={goalWeight}
                    onChange={(e) => setGoalWeight(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-light">Target Date</label>
                  <input
                    type="date"
                    className="form-control progress-input"
                    placeholder="Optional goal date"
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-light">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control progress-input"
                    placeholder="Enter weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-light">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control progress-input"
                    placeholder="Optional"
                    value={chestMeasurement}
                    onChange={(e) => setChestMeasurement(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-light">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control progress-input"
                    placeholder="Optional"
                    value={waistMeasurement}
                    onChange={(e) => setWaistMeasurement(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-light">Hips (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control progress-input"
                    placeholder="Optional"
                    value={hipsMeasurement}
                    onChange={(e) => setHipsMeasurement(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-light">Arms (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control progress-input"
                    placeholder="Optional"
                    value={armsMeasurement}
                    onChange={(e) => setArmsMeasurement(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-light">Body Fat (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control progress-input"
                    placeholder="Optional"
                    value={bodyFatPercentage}
                    onChange={(e) => setBodyFatPercentage(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label text-light">Notes</label>
                  <textarea
                    className="form-control progress-textarea"
                    placeholder="How did you feel? What worked?"
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={loading}
                  ></textarea>
                </div>

                {/* إضافة بسيطة فقط لاستخدام calculateBMI */}
                <div className="col-12">
                  <p className="text-light mb-0">
                    <strong>BMI:</strong> {calculateBMI(weight, 1.75) || "-"}
                  </p>
                </div>

                <div className="col-12 d-flex justify-content-center">
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill py-2 px-5 w-auto"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Progress"}
                  </button>
                </div>
              </div>
            </form>

            {message && (
              <div className={`alert alert-${messageType} rounded-4 mt-4 py-2 mb-0`} role="alert">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>

      {goal && (
        <div className="row justify-content-center mb-5">
          <div className="col-lg-6">
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "24px",
                padding: "40px",
                backdropFilter: "blur(18px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
              }}
            >
              <h3 className="text-white fw-bold mb-4 text-center">Goal Progress</h3>
              {goalProgress ? (
                <>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-light">
                        Progress: {goalProgress.percentage.toFixed(0)}%
                      </span>
                      {goalProgress.isGoalReached && (
                        <span className="badge bg-success">Goal Reached! 🎉</span>
                      )}
                    </div>

                    <div className="progress" style={{ height: "25px" }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${goalProgress.percentage}%` }}
                      >
                        {goalProgress.percentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <div className="text-light small">
                    <p className="mb-1">
                      Start: <strong>{goalProgress.startWeight} kg</strong>
                    </p>
                    <p className="mb-1">
                      Current: <strong>{goalProgress.currentWeight} kg</strong>
                    </p>
                    <p className="mb-1">
                      Target: <strong>{goalProgress.targetWeight} kg</strong>
                    </p>
                    <p className="mb-0">
                      Remaining: <strong>{goalProgress.remaining.toFixed(1)} kg</strong>
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-muted">No progress entries yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card bg-dark border-light rounded-4 p-3 text-center">
              <p className="text-muted small mb-1">Total Change</p>
              <h4 className="text-white fw-bold">{stats.totalChange} kg</h4>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card bg-dark border-light rounded-4 p-3 text-center">
              <p className="text-muted small mb-1">Average Weight</p>
              <h4 className="text-white fw-bold">{stats.avgWeight} kg</h4>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card bg-dark border-light rounded-4 p-3 text-center">
              <p className="text-muted small mb-1">Range</p>
              <h4 className="text-white fw-bold">
                {stats.minWeight} - {stats.maxWeight}
              </h4>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card bg-dark border-light rounded-4 p-3 text-center">
              <p className="text-muted small mb-1">Total Entries</p>
              <h4 className="text-white fw-bold">{stats.entries}</h4>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-12">
          <div className="progress-history-card">
            <div className="progress-history-card-header">
              <div>
                <h3 className="text-white fw-bold mb-1">Progress History</h3>
                <p className="text-muted small mb-0">
                  Recent entries for your fitness progress
                </p>
              </div>
            </div>

            {progressList.length > 0 ? (
              <div className="table-responsive progress-history-table-wrapper">
                <table className="table progress-history-table mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Weight</th>
                      <th>Chest</th>
                      <th>Waist</th>
                      <th>Hips</th>
                      <th>Arms</th>
                      <th>Body Fat</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progressList.map((entry, index) => (
                      <tr key={index}>
                        <td>{entry.day_name || entry.createdAt || entry.date || "Unknown"}</td>
                        <td>{entry.weight} kg</td>
                        <td>{entry.chest || "-"}</td>
                        <td>{entry.waist || "-"}</td>
                        <td>{entry.hips || "-"}</td>
                        <td>{entry.arms || "-"}</td>
                        <td>{entry.bodyFat || "-"}</td>
                        <td className="small">{entry.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted text-center">No progress entries yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Progress;
