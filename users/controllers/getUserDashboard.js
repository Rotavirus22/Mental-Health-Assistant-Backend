const { db } = require("../../database/firebase");

const getUserDashboard = async (req, res) => {
  try {
    const { id: userId } = req.user; // Assuming authentication middleware adds `req.user`

    if (!userId) {
      return res.status(400).json({
        status: "failed",
        message: "Missing required user ID.",
      });
    }

    // Fetch user profile details
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        status: "failed",
        message: "User not found.",
      });
    }

    const userData = userDoc.data();

    // Fetch recent conversations
    const messagesSnapshot = await db
      .collection("messages")
      .where("senderId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(5)
      .get();

    const recentConversations = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return res.status(200).json({
      status: "success",
      message: "Dashboard data fetched successfully.",
      data: {
        user: userData,
        recentConversations,
        // Include other data here (e.g., notifications, recommendations)
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error while fetching dashboard data.",
    });
  }
};

module.exports = getUserDashboard;
