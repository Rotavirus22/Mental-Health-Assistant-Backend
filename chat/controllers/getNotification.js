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

    // Fetch unread messages for the logged-in user
    const receivedMessagesSnapshot = await db
      .collection("messages")
      .where("receiverId", "==", loggedInUserId)
      .where("isRead", "==", false)
      .get();

    if (receivedMessagesSnapshot.empty) {
      return res.status(200).json({
        status: "success",
        message: "No unread messages.",
        notificationCount: 0, // Display notification count as 0
      });
    }

    const notifications = [];
    const userNotificationsRef = db
      .collection("users")
      .doc(loggedInUserId)
      .collection("notifications");

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
          seen: false, // Notification not seen by default
        };

        // Save the notification to Firestore
        const newNotificationRef = userNotificationsRef.doc(); // Auto-generate ID
        const notificationId = newNotificationRef.id;

        await newNotificationRef.set(notification);

        notifications.push({
          ...notification,
          notificationId, // Attach the notification ID
        });

        // Fetch receiver's FCM token
        const receiverSnapshot = await db
          .collection("users")
          .doc(loggedInUserId)
          .get();

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

    // Count the number of unread notifications
    const notificationCountSnapshot = await userNotificationsRef
      .where("seen", "==", false)
      .get();
    const notificationCount = notificationCountSnapshot.size;

    // Respond with notifications and count
    return res.status(200).json({
      status: "success",
      message: "Notifications sent.",
      notifications,
      notificationCount, // Include notification count in response
    });
  } catch (error) {
    console.error("Error fetching chats or sending notifications:", error);
    return res.status(500).json({
      status: "failed",
      message:
        "Internal server error while fetching chats or sending notifications.",
    });
  }
};

  const markNotificationAsRead = async (req, res) => {
    try {
      const { notificationId } = req.body; // Assuming userId and notificationId are provided in the body
  
      const {id: userId } =- req.user;
      if (!notificationId || !userId) {
        return res.status(400).json({
          status: "failed",
          message: "Missing notificationId or userId.",
        });
      }
  
      // Fetch the notification document
      const notificationRef = db
        .collection("users")
        .doc(userId)
        .collection("notifications")
        .doc(notificationId);
  
      const notificationDoc = await notificationRef.get();
  
      if (!notificationDoc.exists) {
        return res.status(404).json({
          status: "failed",
          message: "Notification not found.",
        });
      }
  
      // Update the "seen" field to true
      await notificationRef.update({
        seen: true,
      });
  
      // Respond with success
      return res.status(200).json({
        status: "success",
        message: "Notification marked as read.",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return res.status(500).json({
        status: "failed",
        message: "Internal server error while marking notification as read.",
      });
    }
  };  
  
  const markMessagesAsRead = async (req, res) => {
    try {
      const { senderId } = req.body;

      const { id: loggedInUserId } = req.user;
  
      if (!loggedInUserId || !senderId) {
        return res.status(400).json({
          status: "failed",
          message: "Missing required user ID or sender ID.",
        });
      }
  
      // Query all unread messages from the sender to the logged-in user
      const messagesSnapshot = await db
        .collection("messages")
        .where("receiverId", "==", loggedInUserId)
        .where("senderId", "==", senderId)
        .where("isRead", "==", false)
        .get();
  
      const batch = db.batch();
      messagesSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { isRead: true });
      });
  
      await batch.commit();
  
      return res.status(200).json({
        status: "success",
        message: "Messages marked as read.",
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      return res.status(500).json({
        status: "failed",
        message: "Internal server error while marking messages as read.",
      });
    }
  };
  
  module.exports = {
    getChatsAndNotify,
    markMessagesAsRead,
    markNotificationAsRead
  };