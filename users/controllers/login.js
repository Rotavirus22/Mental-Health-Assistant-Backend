const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const dotenv = require("dotenv");
const jwtManager = require("../../managers/jwtManager");

const {db} = require("../../database/firebase")

const login = async (req,res)=> {

    const {email, password} = req.body;

     // Validating input
  if (!email || !password) {
    return res.status(400).json({
      status: "failed",
      message: "Email and password must be provided",
    });
  }

  // Query Firestore to find the user by email
  const usersRef = db.collection("users");
  const userQuery = await usersRef.where("email", "==", email).get();

  if (userQuery.empty) {
    return res.status(404).json({
      status: "failed",
      message: "Email does not exist in our system",
    });
  }

  // Extract user data from the query result
  const userDoc = userQuery.docs[0];
  const getUser = userDoc.data();

  // Compare the password with the hashed password stored in Firestore
  const comparePassword = await bcrypt.compare(password, getUser.password);

  if (!comparePassword) {
    return res.status(401).json({
      status: "failed",
      message: "Email and password do not match",
    });
  }

  // Generate JWT access token using jwtManager
  const accessToken = jwtManager({
    userId: userDoc.id, // Use the document ID as the user ID
    fullName: getUser.fullName,
  });

  res.status(200).json({
    status: "success",
    message: "User logged in successfully",
    accessToken: accessToken,
  });
};

module.exports = login;