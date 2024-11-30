require("express-async-errors");

const express = require("express");
const cors = require("cors");
const errorHandlers = require("./handlers/errorHandlers");

const {db} = require("./database/firebase");
const userRoute = require("./users/users.route");
const predictionRoute = require("./predictions/prediction.route");
const bodyParser = require('body-parser');


require("dotenv").config();

const app = express();
app.use(cors());

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/users", userRoute);
app.use("/api/pred",predictionRoute);

db.collection('test').doc('testDoc').set({ initialized: true })
    .then(() => {
        console.log("Firebase has been initialized.");
        // Start the server only after Firebase has been initialized
    })
    .catch(error => {
        console.error("Error initializing Firebase:", error);
        process.exit(1);  // Exit the process if Firebase initialization fails
    });

//if any route which isn't found

app.all("*", (req, res, next) => {
    res.status(400).json({
      status: "failed",
      message: "Not found !!",
    });
  });

  app.use(errorHandlers);

  app.listen(8000, () => {
    console.log("Server Started Successfully !");
  });