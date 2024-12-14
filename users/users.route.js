const express = require("express");
const register = require("./controllers/register");
const auth = require("../middleware/auth");
const login = require("./controllers/login");
const getDoctors = require("./controllers/getDoctor");
const getDoctorById = require("./controllers/getSingleDoctor");
const uploadDoc = require("./controllers/uploadDocument");
const upload = require("../middleware/multer");

const userRoute = express.Router();

userRoute.post("/register", register);
userRoute.post("/login",login);

userRoute.use(auth);

userRoute.post("/uploadDoc", upload.single("pdf"), uploadDoc);

userRoute.get("/doctors",getDoctors);
userRoute.get("/doctor/:id",getDoctorById);


module.exports = userRoute;