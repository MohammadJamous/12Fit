const getDietPlan = async (req, res) => {
  try {
    const { goal } = req.body || req.query;

    let plan = [];

    if (goal === "lose_weight") {
      plan = [
        "Breakfast: Oats with banana",
        "Lunch: Grilled chicken salad",
        "Dinner: Soup and vegetables",
      ];
    } else if (goal === "gain_muscle") {
      plan = [
        "Breakfast: Eggs and toast",
        "Lunch: Rice with chicken",
        "Dinner: Beef with potatoes",
      ];
    } else {
      plan = [
        "Breakfast: Yogurt and fruits",
        "Lunch: Balanced meal",
        "Dinner: Light protein meal",
      ];
    }

    return res.json({ dietPlan: plan });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getDietPlan,
};