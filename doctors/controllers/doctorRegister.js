const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const jwtManager = require("../../managers/jwtManager");

const {admin, db} = require("../../database/firebase");

const doctorRegister = async (req, res) => {
    const { fullName, email, password } = req.body;
  
    // Validations
    if (!fullName) throw "Full name must be provided";
    if (!password) throw "Password must be provided";
    if (!email) throw "Email must be provided";
    if (password.length < 5) throw "Password must be more than 5 characters";

    const usersRef = db.collection('users');
    const existingUser = await usersRef.where('email', '==', email).get();

    if (!existingUser.empty) throw "Email already exists";

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
  
    // Create new user in Firestore
    const newUserRef = usersRef.doc(); // Generate a new document ID
    const userId = newUserRef.id;

    const createdUser = {
      userId: userId,
      fullName: fullName,
      role: "doctor",
      email: email,
      verified: "false",
      documentURL: "",
      password: hashedPassword,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
  
    await newUserRef.set(createdUser);
  
    // Generate JWT token
     const accessToken = jwtManager({ id: userId,fullName: fullName,role:"doctor"});
    
    res.status(201).json({
        status: "Doctor registered successfully !!",
        accessToken: accessToken,
      });
}

module.exports = doctorRegister;