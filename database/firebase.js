// firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mental--health-assistant-default.firebaseio.com/",
});

// Initialize Firestore
const db = admin.firestore();
module.exports = { db, admin };  // Export Firestore and admin instances
