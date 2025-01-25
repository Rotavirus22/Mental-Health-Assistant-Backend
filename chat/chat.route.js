const express = require('express');
const auth = require('../middleware/auth');
const sendMessage = require('./controllers/sendMessage');
const getChatHistory = require('./controllers/getMessageHistory');
const getChats = require('./controllers/getLastMessage');
const getChatsAndNotify = require('./controllers/getNotification');

const chatRoute = express.Router();

chatRoute.use(auth);

chatRoute.post("/send",sendMessage);
chatRoute.get("/receive/:receiverId",getChatHistory);
chatRoute.get("/lastMessage",getChats);
chatRoute.get("/notification",getChatsAndNotify);


module.exports = chatRoute;