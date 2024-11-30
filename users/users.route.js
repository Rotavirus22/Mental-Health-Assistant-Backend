const express = require("express");
const register = require("./controllers/register");
const auth = require("../middleware/auth");
const login = require("./controllers/login");
const getDoctors = require("./controllers/getDoctor");

const userRoute = express.Router();

userRoute.post("/register", register);
userRoute.post("/login",login);

userRoute.use(auth);
userRoute.get("/doctors",getDoctors);


module.exports = userRoute;