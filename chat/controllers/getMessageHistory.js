const {db} = require("../../database/firebase");

const getChatHistory = async (req, res) => {
    const { receiverId } = req.params;
  
    try {
      const { id: senderId } = req.user;
      if (!senderId || !receiverId) {
        return res.status(400).json({
          status: "failed",
          message: "Missing required fields: senderId or receiverId.",
        });
      }
  
      const messagesSnapshot = await db
        .collection("messages")
        .where("senderId", "in", [senderId, receiverId]) // Matches both sender and receiver
        .where("receiverId", "in", [senderId, receiverId]) // Matches both sender and receiver
        .orderBy("timestamp", "asc")
        .get();
  
      const messages = messagesSnapshot.docs.map((doc) => doc.data());
  
      return res.status(200).json({
        status: "success",
        data: messages,
      });
    } catch (error) {
      console.error("Get Chat History Error:", error.message);
      return res.status(500).json({
        status: "failed",
        message: "Internal server error while fetching chat history.",
      });
    }
  };
  module.exports = getChatHistory;