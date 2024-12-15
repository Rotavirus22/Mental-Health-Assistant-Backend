const axios = require("axios");
const { db } = require("../../database/firebase");

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

const initiateAndVerifyKhaltiPayment = async (req, res) => {
  const { doctorId } = req.body;

  try {
    const userId = req.user.id; // Assuming the 'id' is in the JWT payload

    if (!doctorId) {
      return res.status(400).json({
        status: "failed",
        message: "Missing required field: doctorId.",
      });
    }

    // Fetch doctor info and subscription fee
    const doctorDoc = await db.collection("users").doc(doctorId).get();

    if (!doctorDoc.exists) {
      return res.status(404).json({
        status: "failed",
        message: "Doctor not found.",
      });
    }

    const doctorData = doctorDoc.data();
    const amount = doctorData.subscriptionFee;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid subscription fee for the doctor.",
      });
    }

    // Prepare payment request payload
    const payload = {
      return_url: "https://mental-health-assistant-backend.onrender.com/khalti-return", // Your frontend return URL
      website_url: "https://mental-health-assistant-backend.onrender.com",
      amount: amount * 100, // Convert to paisa (Khalti expects paisa)
      purchase_order_id: `${userId}_${doctorId}_${Date.now()}`,
      purchase_order_name: "Doctor Subscription",
    };

    const khaltiUrl = "https://a.khalti.com/api/v2/epayment/initiate/";
    
    // Make the API call to initiate the payment
    const initResponse = await axios.post(khaltiUrl, payload, {
      headers: {
        Authorization: `Key ae126d6270104e7d94be09d79696b1f5`,
        "Content-Type": "application/json",
      },
    });

    const { payment_url } = initResponse.data;

    // Return Khalti's payment URL back to the frontend
    return res.status(200).json({
      status: "success",
      message: "Payment URL generated successfully.",
      payment_url,
    });
    
  } catch (error) {
    console.error("Error during Khalti payment initiation:", error.message);
    return res.status(500).json({
      status: "failed",
      message: "Error during payment processing.",
    });
  }
};

module.exports = { initiateAndVerifyKhaltiPayment };
