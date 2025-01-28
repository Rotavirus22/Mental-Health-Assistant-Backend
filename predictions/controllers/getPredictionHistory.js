const { db } = require("../../database/firebase");

const getPredictionHistory = async (req, res) => {
  try {
    const { id: userId } = req.user;

    if (!userId) {
      return res.status(400).json({
        status: "failed",
        message: "User ID is required.",
      });
    }

    // Fetch user's prediction history
    const predictionsSnapshot = await db
      .collection("predictions")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .get();

    if (predictionsSnapshot.empty) {
      return res.status(200).json({
        status: "success",
        message: "No prediction history found.",
        predictions: [],
      });
    }

    const predictionHistory = predictionsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        prediction: data.prediction || "Unknown",
        timestamp: data.timestamp.toDate(), // Convert Firestore timestamp to JS Date
      };
    });

    return res.status(200).json({
      status: "success",
      message: "Prediction history retrieved successfully.",
      predictions: predictionHistory,
    });
  } catch (error) {
    console.error("Error fetching prediction history:", error);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error while fetching prediction history.",
    });
  }
};

module.exports = getPredictionHistory;
