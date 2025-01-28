const { db } = require("../../database/firebase");

const getPaymentHistory = async (req, res) => {
  try {
    const { id: userId } = req.user;

    if (!userId) {
      return res.status(400).json({
        status: "failed",
        message: "User ID is required.",
      });
    }

    // Fetch payment history for the user
    const paymentsSnapshot = await db
      .collection("payments")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .get();

    if (paymentsSnapshot.empty) {
      return res.status(200).json({
        status: "success",
        message: "No payment history found.",
        payments: [],
      });
    }

    const paymentHistory = [];

    for (const doc of paymentsSnapshot.docs) {
      const paymentData = doc.data();

      // Fetch doctor's name from users collection
      let doctorName = "Unknown Doctor";
      if (paymentData.doctorId) {
        const doctorSnapshot = await db.collection("users").doc(paymentData.doctorId).get();
        if (doctorSnapshot.exists) {
          doctorName = doctorSnapshot.data().fullName || "Unknown Doctor";
        }
      }

      paymentHistory.push({
        paymentId: doc.id,
        doctorName,
        doctorId:paymentData.doctorId,
        amount: paymentData.amount,
        paymentStatus: paymentData.paymentStatus,
        transactionId: paymentData.transactionId,
        timestamp: paymentData.timestamp.toDate(),
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Payment history retrieved successfully.",
      payments: paymentHistory,
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error while fetching payment history.",
    });
  }
};

module.exports = getPaymentHistory;
