const express = require("express");
const auth = require("../middleware/auth");
const { initiateAndVerifyKhaltiPayment } = require("./controllers/initiatePayment");

const subscriptionRoute = express.Router();

subscriptionRoute.use(auth);

subscriptionRoute.post("/initiate",initiateAndVerifyKhaltiPayment);
module.exports = subscriptionRoute;