const { db,admin } = require("../../database/firebase");

const getChatsAndNotify = async (req, res) => {
  try {
    const { id: loggedInUserId } = req.user;

    if (!loggedInUserId) {
      return res.status(400).json({
        status: "failed",
        message: "Missing required user ID.",
      });
    }

    // Fetch all messages received by the logged-in user
    const receivedMessagesSnapshot = await db
      .collection("messages")
      .where("receiverId", "==", loggedInUserId)
      .get();

    if (receivedMessagesSnapshot.empty) {
      return res.status(200).json({
        status: "success",
        message: "No new messages.",
      });
    }

    const notifications = [];
    for (const doc of receivedMessagesSnapshot.docs) {
      const msg = doc.data();
      const senderSnapshot = await db.collection("users").doc(msg.senderId).get();

      if (senderSnapshot.exists) {
        const senderData = senderSnapshot.data();

        // Example notification object
        const notification = {
          title: `New message from ${senderData.fullName}`,
          body: msg.message || "You have a new message.",
          timestamp: msg.timestamp?._seconds || Date.now(),
        };

        notifications.push(notification);

        // Fetch receiver's FCM token
        const receiverSnapshot = await db.collection("users").doc(loggedInUserId).get();
        if (receiverSnapshot.exists) {
          const receiverData = receiverSnapshot.data();

          if (receiverData.fcmToken) {
            // Send push notification using Firebase Admin
            await admin.messaging().send({
              token: receiverData.fcmToken,
              notification: {
                title: notification.title,
                body: notification.body,
              },
              data: {
                senderId: msg.senderId,
                chatId: doc.id,
              },
            });
          }
        }
      }
    }

    // Respond with notification summary
    return res.status(200).json({
      status: "success",
      message: "Notifications sent.",
      notifications,
    });
  } catch (error) {
    console.error("Error fetching chats or sending notifications:", error);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error while fetching chats or sending notifications.",
    });
  }
};

module.exports = getChatsAndNotify;
