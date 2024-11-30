const { db } = require("../../database/firebase");

const getDoctors = async (req, res) => {
    try {
        // Query the "users" collection for users with the role "doctor"
        const doctorsQuerySnapshot = await db.collection('users').where('role', '==', 'doctor').get();

        if (doctorsQuerySnapshot.empty) {
            return res.status(404).json({
                status: "failed",
                message: "No doctors found in the database",
            });
        }

        // Map the query results to an array of doctor data
        const doctors = doctorsQuerySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return res.status(200).json({
            status: "success",
            message: "Doctors retrieved successfully",
            doctors: doctors,
        });
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return res.status(500).json({
            status: "failed",
            message: "Internal server error while fetching doctors",
        });
    }
};

module.exports = getDoctors;
