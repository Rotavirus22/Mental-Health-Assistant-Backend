const {db} = require("../../database/firebase");

const listJournals = async (req, res) => {
    try {
      const { id: userId } = req.user; // Logged-in user's ID
  
      if (!userId) {
        return res.status(400).json({
          status: "failed",
          message: "User ID is required.",
        });
      }
  
      // Fetch all journals for the user
      const journalRef = db.collection("users").doc(userId).collection("journals");
      const journalsSnapshot = await journalRef.orderBy("createdAt", "desc").get();
  
      const journals = journalsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      return res.status(200).json({
        status: "success",
        journals,
      });
    } catch (error) {
      console.error("Error listing journals:", error);
      return res.status(500).json({
        status: "failed",
        message: "Internal server error while listing journals.",
      });
    }
  };

  module.exports = listJournals;