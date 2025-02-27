const { db } = require("../../database/firebase");
const { v4: uuidv4 } = require("uuid");

const checkSubscriptionAndInitiatePayment = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const { id: userId } = req.user;

    if (!userId || !doctorId) {
      return res.status(400).json({ error: "User ID and Doctor ID are required." });
    }

    // Fetch user and doctor details from Firestore
    const userDoc = await db.collection("users").doc(userId).get();
    const doctorDoc = await db.collection("users").doc(doctorId).get();

    if (!userDoc.exists || !doctorDoc.exists) {
      return res.status(404).json({ error: "User or Doctor not found." });
    }

    const userData = userDoc.data();
    const doctorData = doctorDoc.data();

    // Check if the user is already subscribed to the doctor
    if (userData.subscribedDoctors && userData.subscribedDoctors.includes(doctorId)) {
      return res.json({
        message: "You are already subscribed to this doctor.",
        canChat: true,
      });
    }

    // User is not subscribed, initiate payment
    const transactionId = uuidv4();
    const esewaConfig = {
      amt: doctorData.subscriptionFee,
      tAmt: doctorData.subscriptionFee,
      txAmt: "0",
      psc: "0",
      pdc: "0",
      scd: process.env.ESEWA_MERCHANT_CODE,
      pid: transactionId,
      secret_key: process.env.SECRET_KEY,
      su: `${process.env.BACKEND_URI}/api/payment/success?userId=${userId}&doctorId=${doctorId}&transactionId=${transactionId}`,
      fu: `${process.env.BACKEND_URI}/api/payment/failure?transactionId=${transactionId}`,
    };

    return res.json({
      message: "Payment required to subscribe to this doctor.",
      paymentUrl: "https://rc.esewa.com.np/epay/main",
      esewaConfig,
    });
  } catch (error) {
    console.error("Error in payment process:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = checkSubscriptionAndInitiatePayment;
