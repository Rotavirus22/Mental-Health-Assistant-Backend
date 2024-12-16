// File: khaltiPaymentVerify.js

const axios = require("axios");
const { db } = require("../../database/firebase"); // Import Firestore instance

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

// Function to verify Khalti payment
const verifyKhaltiPayment = async (pidx) => {
  try {
    const payload = { pidx };
    const khaltiUrl = `https://a.khalti.com/api/v2/epayment/verify/`;

    // Request to verify payment from Khalti
    const response = await axios.post(khaltiUrl, payload, {
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error verifying Khalti payment:", error.message);
    throw new Error("Error verifying payment.");
  }
};

// Express route to complete Khalti payment
const completeKhaltiPayment = async (req, res) => {
  const {
    pidx,
    txnId,
    amount,
    mobile,
    purchase_order_id,
    purchase_order_name,
    transaction_id,
  } = req.query;

  try {
    // Verify the payment with Khalti
    const paymentInfo = await verifyKhaltiPayment(pidx);

    // Check if payment is completed and details match
    if (
      paymentInfo?.status !== "Completed" ||
      paymentInfo.transaction_id !== transaction_id ||
      Number(paymentInfo.total_amount) !== Number(amount)
    ) {
      return res.status(400).json({
        success: false,
        message: "Incomplete information",
        paymentInfo,
      });
    }

    // Check if the purchase order exists in Firebase Firestore
    const purchasedItemDoc = await db.collection("purchased_items").doc(purchase_order_id).get();

    if (!purchasedItemDoc.exists || purchasedItemDoc.data().totalPrice !== amount) {
      return res.status(400).send({
        success: false,
        message: "Purchased data not found or price mismatch.",
      });
    }

    // Update the purchased item status to 'completed'
    await db.collection("purchased_items").doc(purchase_order_id).update({
      status: "completed",
    });

    // Create a payment record for successful transaction
    await db.collection("payments").add({
      pidx,
      transactionId: transaction_id,
      productId: purchase_order_id,
      amount,
      paymentStatus: "success",
      paymentGateway: "khalti",
    });

    // Return success response
    res.json({
      success: true,
      message: "Payment Successful",
    });
  } catch (error) {
    console.error("Error during Khalti payment verification:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error,
    });
  }
};

module.exports = { completeKhaltiPayment };
