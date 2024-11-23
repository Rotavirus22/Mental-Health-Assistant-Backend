const express = require("express");
const register = require("./controllers/register");
const { auth } = require("firebase-admin");
const login = require("./controllers/login");

const userRoute = express.Router();

userRoute.post("/register", register);
userRoute.post("/login",login);

userRoute.use(auth);

module.exports = userRoute;