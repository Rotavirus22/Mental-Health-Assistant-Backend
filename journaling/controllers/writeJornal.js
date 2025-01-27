const { db } = require("../../database/firebase");

const writeJournal = async (req, res) => {
  try {
    const { id: userId } = req.user; 
    const { title, content } = req.body;

    if (!userId || !title || !content) {
      return res.status(400).json({
        status: "failed",
        message: "User ID, title, and content are required.",
      });
    }

    const journalRef = db.collection("users").doc(userId).collection("journals");
    const newJournal = {
      id: journalDoc.id,
      title: title,
      content: content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const journalDoc = await journalRef.add(newJournal);

    return res.status(200).json({
      status: "success",
      message: "Journal saved successfully.",
      journalId: journalDoc.id,
    });
  } catch (error) {
    console.error("Error saving journal:", error);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error while saving journal.",
    });
  }
};

module.exports = writeJournal;