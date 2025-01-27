const { db } = require("../../database/firebase");

const readJournal = async (req, res) => {
    try {
      const { id: userId } = req.user; 
      const { journalId } = req.params; 
  
      if (!userId || !journalId) {
        return res.status(400).json({
          status: "failed",
          message: "User ID and journal ID are required.",
        });
      }
  
      // Fetch the journal entry
      const journalRef = db
        .collection("users")
        .doc(userId)
        .collection("journals")
        .doc(journalId);
  
      const journalDoc = await journalRef.get();
  
      if (!journalDoc.exists) {
        return res.status(404).json({
          status: "failed",
          message: "Journal not found.",
        });
      }
  
      return res.status(200).json({
        status: "success",
        journal: journalDoc.data(),
      });
    } catch (error) {
      console.error("Error reading journal:", error);
      return res.status(500).json({
        status: "failed",
        message: "Internal server error while reading journal.",
      });
    }
  };

  module.exports = readJournal;