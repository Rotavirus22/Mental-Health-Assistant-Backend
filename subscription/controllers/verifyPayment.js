const { db, admin } = require("../../database/firebase");

const paymentSuccess = async (req, res) => {
  try {
    const { userId, doctorId, transactionId } = req.query;

    if (!userId || !doctorId || !transactionId) {
      return res.status(400).json({ error: "Missing required query parameters." });
    }

    const timestamp = admin.firestore.Timestamp.now();
    const doctorDoc = await db.collection("users").doc(doctorId).get();

    if (!doctorDoc.exists) {
      return res.status(404).json({ error: "Doctor not found." });
    }

    const doctorData = doctorDoc.data();
    const amount = doctorData.subscriptionFee;

    // Update user subscription in Firestore
    const userRef = db.collection("users").doc(userId);
    await userRef.update({
      subscribedDoctors: admin.firestore.FieldValue.arrayUnion(doctorId),
    });

    // Save payment details
    const paymentRef = db.collection("payments").doc(transactionId);
    await paymentRef.set({
      userId,
      doctorId,
      amount,
      paymentStatus: "success",
      timestamp,
      transactionId,
    });

    // Redirect to the frontend success page
    res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ error: "Payment success handling failed." });
  }
};

module.exports = paymentSuccess;
