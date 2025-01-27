const express = require("express");
const auth = require("../middleware/auth");
const checkSubscriptionAndInitiatePayment = require("./controllers/initiatePayment");
const paymentSuccess = require("./controllers/verifyPayment");
const paymentFailure = require("./controllers/failedPayment");

const subscriptionRoute = express.Router();

subscriptionRoute.use(auth);

subscriptionRoute.post("/check",checkSubscriptionAndInitiatePayment);
subscriptionRoute.get("/success",paymentSuccess)
subscriptionRoute.get("/failure", paymentFailure);

module.exports = subscriptionRoute;