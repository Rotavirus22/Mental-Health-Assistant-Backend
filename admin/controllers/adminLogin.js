const bcrypt = require("bcrypt");  // You can use bcrypt for password hashing
const { db } = require("../../database/firebase");  // Firebase database import
const jwtManager = require("../../managers/jwtManager");  // JWT manager import

const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query database to find the user by email (You can modify this based on your database schema)
    const adminRef = db.collection("users").where("email", "==", email);
    const adminSnapshot = await adminRef.get();

    if (adminSnapshot.empty) {
      return res.status(404).json({
        status: "failed",
        message: "Admin not found!",
      });
    }

    const admin = adminSnapshot.docs[0].data();

    // Verify if the user is an admin and if the password matches
    if (admin.role !== "admin") {
      return res.status(403).json({
        status: "failed",
        message: "Only admins can log in.",
      });
    }

    const match = await bcrypt.compare(password, admin.password); // Assuming the password is hashed in DB

    if (!match) {
      return res.status(401).json({
        status: "failed",
        message: "Incorrect password!",
      });
    }

    // Generate JWT token
    const token = jwtManager({
      userId: admin.userId,
      fullName: admin.fullName,
      role: admin.role,
    });

    // Respond with the token
    res.status(200).json({
      status: "success",
      message: "Login successful",
      token: token,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

module.exports = adminLogin;
