const express = require('express');
const predictionn = require('./controllers/prediction');
const auth = require('../middleware/auth');
const verifyToken = require('../managers/verifyUser');

const predictionRoute = express.Router();

predictionRoute.use(auth);

predictionRoute.post("/predict",verifyToken,predictionn);

module.exports = predictionRoute;