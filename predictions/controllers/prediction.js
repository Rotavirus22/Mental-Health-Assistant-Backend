const axios = require('axios');
const { db } = require('../../database/firebase');

const predictionn = async (req, res) => {
  const { responses } = req.body;

  try {
    // Verify User ID
    const userId = req.user.uid;
    if (!userId) {
      return res.status(401).json({
        status: 'failed',
        message: 'Unauthorized: User ID is missing',
      });
    }

    // Check if the user already has a prediction
    const predictionQuery = await db
      .collection('predictions')
      .where('userId', '==', userId)
      .get();

    if (!predictionQuery.empty) {
      return res.status(403).json({
        status: 'failed',
        message: 'Prediction already exists. Delete previous to continue.',
      });
    }

    // Validate responses (Basic Check)
    if (!Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({
        status: 'failed',
        message: 'Invalid input: Responses are missing or not in the correct format.',
      });
    }

    // External API Call with Retry Logic
    let predictionResponse;
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        predictionResponse = await axios.post(
          'https://mental-health-assistant-ml.onrender.com/predict',
          { responses }
        );
        break; // Exit loop on success
      } catch (apiError) {
        if (attempt === maxRetries - 1 || apiError.response?.status !== 503) {
          throw apiError; // Rethrow on last attempt or non-retryable error
        }
        console.warn('Retrying external API call:', attempt + 1);
      }
    }

    if (!predictionResponse || !predictionResponse.data.prediction) {
      throw new Error('Invalid response from prediction API');
    }

    // Save Prediction to Firebase
    const predictionRef = db.collection('predictions').doc();
    await predictionRef.set({
      userId,
      prediction: predictionResponse.data.prediction,
      timestamp: new Date(),
    });

    return res.status(200).json({
      status: 'success',
      message: 'Prediction saved successfully',
      prediction: predictionResponse.data.prediction,
    });
  } catch (error) {
    console.error('Error:', error.message || error);

    let errorMessage = 'Internal Server Error';
    if (error.response?.status === 503) {
      errorMessage = 'Prediction service unavailable. Please try again later.';
    } else if (error.response) {
      errorMessage = `External API error: ${error.response.status}`;
    }

    return res.status(500).json({
      status: 'failed',
      message: errorMessage,
    });
  }
};

module.exports = predictionn;
