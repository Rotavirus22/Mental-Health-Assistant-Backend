const { db } = require("../../database/firebase");  // Import Firebase database
const jwtManager = require("../../managers/jwtManager");  // JWT manager (if needed for other purposes)

const getPendingDoctors = async (req, res) => {
  try {
    // Query the database for doctors with 'pending' verification status
    const doctorsRef = db.collection("users").where("role", "==", "doctor").where("verified", "==", "pending");
    const snapshot = await doctorsRef.get();

    // If no doctors are found
    if (snapshot.empty) {
      return res.status(404).json({
        status: "failed",
        message: "No pending doctors found.",
      });
    }

    const pendingDoctors = snapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });

    // Return the list of pending doctors
    res.status(200).json({
      status: "success",
      data: pendingDoctors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

const verifyDoctor = async (req, res) => {
  const { doctorId } = req.params;

  try {
    // Check if doctor exists
    const doctorRef = db.collection("users").doc(doctorId);
    const doctorDoc = await doctorRef.get();

    if (!doctorDoc.exists) {
      return res.status(404).json({
        status: "failed",
        message: "Doctor not found.",
      });
    }

    const doctorData = doctorDoc.data();

    // Ensure that only pending doctors can be verified
    if (doctorData.verified !== "pending") {
      return res.status(400).json({
        status: "failed",
        message: "This doctor's document is already verified or rejected.",
      });
    }

    // Update verification status to 'verified'
    await doctorRef.update({
      verified: "verified",
    });

    res.status(200).json({
      status: "success",
      message: "Doctor verified successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

const rejectDoctor = async (req, res) => {
    const { doctorId } = req.params;
  
    try {
      const doctorRef = db.collection("users").doc(doctorId);
      const doctorDoc = await doctorRef.get();
  
      if (!doctorDoc.exists) {
        return res.status(404).json({
          status: "failed",
          message: "Doctor not found.",
        });
      }
  
      const doctorData = doctorDoc.data();
  
      // Check if the document is pending before rejecting
      if (doctorData.verified !== "pending") {
        return res.status(400).json({
          status: "failed",
          message: "This doctor's document is already verified or rejected.",
        });
      }
  
      // Update verification status to 'rejected'
      await doctorRef.update({
        verified: "rejected",
      });
  
      res.status(200).json({
        status: "success",
        message: "Doctor's document rejected successfully.",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "failed",
        message: "Internal server error",
      });
    }
  };

module.exports = {
  getPendingDoctors,
  verifyDoctor,
  rejectDoctor
};
