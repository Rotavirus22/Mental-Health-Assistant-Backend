const express = require("express");
const register = require("./controllers/register");
const auth = require("../middleware/auth");
const login = require("./controllers/login");
const getDoctors = require("./controllers/getDoctor");
const getDoctorById = require("./controllers/getSingleDoctor");
const upload = require("../middleware/multer");
const getUserDashboard = require("./controllers/getUserDashboard");

const userRoute = express.Router();

userRoute.post("/register", register);
userRoute.post("/login",login);

userRoute.use(auth);

userRoute.get("/doctors",getDoctors);
userRoute.get("/doctor/:id",getDoctorById);
userRoute.get("/dashboard",getUserDashboard);


module.exports = userRoute;