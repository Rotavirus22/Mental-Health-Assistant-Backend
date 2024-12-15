const express = require("express");
const doctorAuth = require("./controllers/doctorAuth");
const doctorLogin = require("./controllers/doctorLogin");
const doctorRegister = require("./controllers/doctorRegister");
const verifyToken = require("../managers/verifyUser");
const uploadDoc = require("./controllers/uploadDocument");
const upload = require("../middleware/multer");



const doctorRoute = express.Router();

doctorRoute.post("/login",doctorLogin);
doctorRoute.post("/register",doctorRegister);

doctorRoute.use(doctorAuth);
doctorRoute.post("/uploadDoc", upload.single("pdf"), verifyToken, uploadDoc);

module.exports = doctorRoute;

