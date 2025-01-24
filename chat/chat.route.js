const express = require('express');
const auth = require('../middleware/auth');
const sendMessage = require('./controllers/sendMessage');
const getChatHistory = require('./controllers/getMessageHistory');

const chatRoute = express.Router();

chatRoute.use(auth);

chatRoute.post("/send",sendMessage);
chatRoute.get("/receive/:receiverId",getChatHistory);


module.exports = chatRoute;