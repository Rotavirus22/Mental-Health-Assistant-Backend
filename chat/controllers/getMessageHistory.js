const { db } = require("../../database/firebase");

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

    // Query for messages where senderId and receiverId match explicitly
    const messagesSnapshot = await db
      .collection("messages")
      .where("senderId", "==", senderId)
      .where("receiverId", "==", receiverId)
      .orderBy("timestamp", "asc")
      .get();

    const sentMessages = messagesSnapshot.docs.map((doc) => doc.data());

    // Query for messages where receiverId is the sender and senderId is the receiver
    const receivedMessagesSnapshot = await db
      .collection("messages")
      .where("senderId", "==", receiverId)
      .where("receiverId", "==", senderId)
      .orderBy("timestamp", "asc")
      .get();

    const receivedMessages = receivedMessagesSnapshot.docs.map((doc) => doc.data());

    // Combine sent and received messages and sort them by timestamp
    const allMessages = [...sentMessages, ...receivedMessages].sort(
      (a, b) => a.timestamp.toMillis() - b.timestamp.toMillis()
    );

    return res.status(200).json({
      status: "success",
      data: allMessages,
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
