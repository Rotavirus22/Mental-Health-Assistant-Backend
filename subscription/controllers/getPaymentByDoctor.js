const { db } = require("../../database/firebase");

const getPaymentsByDoctor = async (req, res) => {
  try {
    const { id: doctorId } = req.user; // Assuming doctorId is retrieved from authentication

    if (!doctorId) {
      return res.status(400).json({
        status: "failed",
        message: "Doctor ID is required.",
      });
    }

    // Fetch all payments where the doctorId matches
    const paymentsSnapshot = await db.collection("payments").where("doctorId", "==", doctorId).get();

    if (paymentsSnapshot.empty) {
      return res.status(200).json({
        status: "success",
        message: "No payments received.",
        payments: [],
      });
    }

    const payments = [];
    for (const doc of paymentsSnapshot.docs) {
      const paymentData = doc.data();

      // Fetch user details
      const userSnapshot = await db.collection("users").doc(paymentData.userId).get();
      const userName = userSnapshot.exists ? userSnapshot.data().fullName : "Unknown User";

      // Construct payment record
      payments.push({
        amount: paymentData.amount,
        userId: paymentData.userId,
        userName: userName,
        paymentStatus: paymentData.paymentStatus,
        timestamp: paymentData.timestamp,
        transactionId: paymentData.transactionId,
      });
    }

    return res.status(200).json({
      status: "success",
      message: `Payments received by doctor ${doctorId}.`,
      payments,
    });
  } catch (error) {
    console.error("Error fetching doctor's payments:", error);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error while fetching payments.",
    });
  }
};

module.exports = getPaymentsByDoctor;
