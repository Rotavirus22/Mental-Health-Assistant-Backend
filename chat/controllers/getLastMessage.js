const { db } = require("../../database/firebase");

const getChats = async (req, res) => {
  try {
    const { id: loggedInUserId } = req.user;

    if (!loggedInUserId) {
      return res.status(400).json({
        status: "failed",
        message: "Missing required user ID.",
      });
    }

    // Fetch all sent and received messages
    const sentMessagesSnapshot = await db
      .collection("messages")
      .where("senderId", "==", loggedInUserId)
      .get();

    const receivedMessagesSnapshot = await db
      .collection("messages")
      .where("receiverId", "==", loggedInUserId)
      .get();

    const allMessages = [
      ...sentMessagesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ...receivedMessagesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    ];

    // Create a map of the latest message for each user
    const chatMap = new Map();
    allMessages.forEach((msg) => {
      const otherUserId = msg.senderId === loggedInUserId ? msg.receiverId : msg.senderId;

      if (!chatMap.has(otherUserId) || chatMap.get(otherUserId).timestamp < msg.timestamp) {
        chatMap.set(otherUserId, {
          userId: otherUserId,
          lastMessage: msg.message || "No message available",
          timestamp: msg.timestamp,
        });
      }
    });

    // Fetch user details and prepare the chat list
    const chatList = [];
    for (const [_, chat] of chatMap) {
      console.log("Fetching user with ID:", chat.userId);
      const userSnapshot = await db.collection("users").doc(chat.userId).get();

      if (userSnapshot.exists) {
        const userData = userSnapshot.data();
        chatList.push({
          id:userData.userId,
          name: userData.fullName || "Unknown User",
          lastMessage: chat.lastMessage,
          timestamp: chat.timestamp,
          isRead: userData.isRead || false,
        });
      } else {
        console.warn(`User not found for ID: ${chat.userId}`);
        chatList.push({
          name: "Unknown User",
          lastMessage: chat.lastMessage,
          timestamp: chat.timestamp,
          isRead: false,
        });
      }
    }

    // Sort chats by timestamp in descending order
    chatList.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

    // Return the final chat list
    return res.status(200).json({
      status: "success",
      chats: chatList,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error while fetching chats.",
    });
  }
};

module.exports = getChats;
