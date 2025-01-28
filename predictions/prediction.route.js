const express = require('express');
const predictionn = require('./controllers/prediction');
const auth = require('../middleware/auth');
const verifyToken = require('../managers/verifyUser');
const getPredictionHistory = require('./controllers/getPredictionHistory');

const predictionRoute = express.Router();

predictionRoute.use(auth);

predictionRoute.post("/predict",verifyToken,predictionn);
predictionRoute.get("/history",getPredictionHistory);

module.exports = predictionRoute;