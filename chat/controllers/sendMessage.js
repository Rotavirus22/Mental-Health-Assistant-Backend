const { db } = require("../../database/firebase");

const sendMessage = async (req, res) => {
  const { receiverId, message } = req.body;

  try {
    // Extract sender details from the authenticated user's token (assuming middleware adds `req.user`)
    const { id: senderId, name: senderName } = req.user; // Adjust keys to match your token payload

    if (!senderId || !senderName || !receiverId|| !message) {
      return res.status(400).json({
        status: "failed",
        message: "Missing required fields: senderId, senderName, receiverId, receiverName, or message.",
      });
    }

    await db.collection("messages").add({
      senderId,
      senderName,
      receiverId,
      message,
      isRead: false, // Indicates whether the receiver has read the message
      timestamp: new Date(),
    });

    return res.status(200).json({
      status: "success",
      message: "Message sent successfully.",
    });
  } catch (error) {
    console.error("Send Message Error:", error.message);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error while sending message.",
    });
  }
};

module.exports = sendMessage;
