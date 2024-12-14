const axios = require ('axios');
const {db} = require('../../database/firebase');

const predictionn = async (req,res)=> {
const {responses} = req.body;

try{

  const userId = req.user.uid;

  if (!userId) {
    return res.status(401).json({
      status: "failed",
      message: "Unauthorized: User ID is missing",
    });
  }

const predictionResponse = await axios.post(
    "http://127.0.0.1:5000/predict", // Replace with your prediction API endpoint
    { responses: responses }
  );


  const predictionQuery = await db
      .collection("predictions")
      .where("userId", "==", userId)
      .get();

    if (!predictionQuery.empty) {
      return res.status(403).json({
        status: "failed",
        message: "You have already made a prediction. Please delete the prediction made earlier to continue.",
      });
    }

const prediction = predictionResponse.data.prediction;


const predictionRef = db.collection("predictions").doc();
await predictionRef.set({
  userId: userId,  // Reference the userId
  prediction: prediction,
  timestamp: new Date(),
});


return res.status(200).json({
    status: "success",
    message: "Prediction saved successfully",
    prediction: prediction,
  });
} catch (error) {
  console.error("Error processing prediction or saving to Firebase:", error);
  return res.status(500).json({
    status: "failed",
    message: "Internal Server Error",
  });
}
}

module.exports = predictionn;
