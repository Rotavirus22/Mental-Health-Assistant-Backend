const { db } = require("../../database/firebase");
const axios = require("axios");

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

// Initialize Khalti payment
const initializeKhaltiPayment = async ({ amount, purchase_order_id, purchase_order_name, return_url, website_url }) => {
  try {
    const payload = {
      return_url,
      website_url,
      amount,
      purchase_order_id,
      purchase_order_name,
    };

    const khaltiUrl = "https://a.khalti.com/api/v2/epayment/initiate/";

    // Send request to Khalti to initiate payment
    const initResponse = await axios.post(khaltiUrl, payload, {
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const { payment_url } = initResponse.data;
    return payment_url;
  } catch (error) {
    console.error("Error during Khalti payment initiation:", error.message);
    throw new Error("Error during payment processing.");
  }
};

// API Endpoint to initiate Khalti payment
const initiateKhaltiPayment = async (req, res) => {
  // Ensure userId exists in req.user and doctorId in req.body
  const { doctorId, website_url } = req.body;
  const userId = req.user.uid;
  
  console.log(userId);
  // Use uid from req.user (after JWT token verification)

  // Check if both doctorId and userId exist
  if (!userId || !doctorId) {
    return res.status(400).json({
      status: "failed",
      message: "Missing required fields: userId or doctorId.",
    });
  }

  try {
    // Fetch doctor details from Firestore
    const doctorRef = db.collection("users").doc(doctorId);
    const doctorDoc = await doctorRef.get();

    if (!doctorDoc.exists) {
      return res.status(404).json({
        status: "failed",
        message: "Doctor not found.",
      });
    }

    const doctorData = doctorDoc.data();
    const amount = doctorData.subscriptionFee;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid subscription fee for the doctor.",
      });
    }

    // Generate a unique purchase order id
    const purchaseOrderId = `${userId}_${doctorId}_${Date.now()}`;

    // Create purchase record in Firestore
    const purchaseData = {
      userId: userId,  // Ensure valid userId is passed
      doctorId: doctorId, // Ensure valid doctorId is passed
      paymentMethod: "khalti",
      totalPrice: amount * 100, // price in paisa (Khalti expects paisa)
      status: "pending",
      purchaseOrderId: purchaseOrderId,
    };

    if (!purchaseData.userId || !purchaseData.doctorId || !purchaseData.purchaseOrderId) {
      throw new Error("Missing required fields when creating purchase document");
    }

    // Save purchase data to Firestore (Purchased items collection)
    await db.collection("purchased_items").add(purchaseData);

    // Initialize Khalti payment request
    const return_url = `${process.env.BACKEND_URI}/verify`; // Make sure return_url is valid
    const paymentUrl = await initializeKhaltiPayment({
      amount: amount * 100, // Convert amount to paisa
      purchase_order_id: purchaseOrderId,
      purchase_order_name: "Doctor Subscription",
      return_url,
      website_url,
    });

    // Return the Khalti payment URL
    return res.status(200).json({
      status: "success",
      message: "Payment URL generated successfully.",
      payment_url: paymentUrl,
    });
    
  } catch (error) {
    console.error("Error during Khalti payment initialization:", error.message);
    res.status(500).json({
      status: "failed",
      message: error.message || "Error during payment processing.",
    });
  }
};

module.exports = { initiateKhaltiPayment };
