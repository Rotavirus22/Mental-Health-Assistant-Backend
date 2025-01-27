const { db } = require("../../database/firebase");

 const paymentSuccess = async (req, res) => {
  try {
    const { userId, doctorId } = req.query;

    // Update user subscription in Firestore
    const userRef = db.collection("users").doc(userId);
    await userRef.update({
      subscribedDoctors: admin.firestore.FieldValue.arrayUnion(doctorId),
    });

    const paymentRef = db.collection("payments").doc(); // Auto-generate ID
    await paymentRef.set({
      userId,
      doctorId,
      amount,
      paymentStatus: "success",
      timestamp,
    });

    res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ error: "Payment success handling failed." });
  }
};


module.exports = paymentSuccess;