const express = require("express");
const auth = require("../middleware/auth");
const { initiateKhaltiPayment } = require("./controllers/initiatePayment");
const { completeKhaltiPayment } = require("./controllers/verifyPayment");
const verifyToken = require("../managers/verifyUser");

const subscriptionRoute = express.Router();

subscriptionRoute.use(auth);

subscriptionRoute.post("/initiate",verifyToken,initiateKhaltiPayment);
subscriptionRoute.get("/verify",completeKhaltiPayment);

module.exports = subscriptionRoute;