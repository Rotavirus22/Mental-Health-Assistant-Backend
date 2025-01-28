const express = require("express");
const auth = require("../middleware/auth");
const checkSubscriptionAndInitiatePayment = require("./controllers/initiatePayment");
const paymentSuccess = require("./controllers/verifyPayment");
const paymentFailure = require("./controllers/failedPayment");
const getPaymentHistory = require("./controllers/paymentHistory");

const subscriptionRoute = express.Router();

subscriptionRoute.get("/success",paymentSuccess);
subscriptionRoute.get("/failure", paymentFailure);

subscriptionRoute.use(auth);

subscriptionRoute.post("/check",checkSubscriptionAndInitiatePayment);
subscriptionRoute.get("/history",getPaymentHistory);


module.exports = subscriptionRoute;