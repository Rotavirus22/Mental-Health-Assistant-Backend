const express = require("express");
const adminLogin = require("./controllers/adminLogin");
const adminAuth = require("./controllers/admin_auth");
const { getPendingDoctors, verifyDoctor, rejectDoctor } = require("./controllers/adminWork");



const adminRoute = express.Router();

adminRoute.post("/login",adminLogin);

adminRoute.use(adminAuth);

adminRoute.get("/pendingDoctors",getPendingDoctors);

adminRoute.put("/verify-doctor/:doctorId", verifyDoctor);

adminRoute.put("/reject-doctor/:doctorId", rejectDoctor);

module.exports = adminRoute;

