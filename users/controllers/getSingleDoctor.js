const { db } = require("../../database/firebase");

const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params; // Extract the doctor ID from the request parameters

        // Query the Firestore for a document with the given ID in the "users" collection
        const doctorDoc = await db.collection('users').doc(id).get();

        if (!doctorDoc.exists) {
            return res.status(404).json({
                status: "failed",
                message: "Doctor not found with the given ID",
            });
        }

        // Extract doctor data
        const doctor = {
            id: doctorDoc.id,
            ...doctorDoc.data(),
        };

        return res.status(200).json({
            status: "success",
            message: "Doctor retrieved successfully",
            doctor: doctor,
        });
    } catch (error) {
        console.error("Error fetching doctor:", error);
        return res.status(500).json({
            status: "failed",
            message: "Internal server error while fetching doctor",
        });
    }
};

module.exports = getDoctorById;
