const {db} = require("../../database/firebase");
const fs = require("fs");
const pdf = require("pdf-parse");
const cloudinary = require("../../utils/cloudinary");


const uploadDoc = async (req,res) => {

    try{
        const userId = req.user.uid;


        if (!req.file) {
          return res.status(400).json({
            status: "failed",
            message: "No file uploaded.",
          });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "raw",
          });
          const pdfData = await pdf(fs.readFileSync(req.file.path));



          const userDocRef = db.collection("users").doc(userId);
          const userDoc = await userDocRef.get();

          const userData = userDoc.data();

          // Ensure the user is a doctor
          if (userData.role !== "doctor") {
              return res.status(403).json({
                  status: "failed",
                  message: "Unauthorized: Only doctors can upload documents.",
              });
          }
          await userDocRef.update({
            documentUrl: result.secure_url, // Add the uploaded document's URL
            verified: "pending", // Update the verification status to "pending"
        });

        fs.unlinkSync(req.file.path);
        res.status(200).json({
          status: "Success",
          message: "Document Uploaded Successfully and waiting for verification",
        });
        
    }catch(e){
        console.error(e);
    res.status(500).json({
      status: "Error",
      message: "Internal Server error",
    });
    }
}
module.exports = uploadDoc;

