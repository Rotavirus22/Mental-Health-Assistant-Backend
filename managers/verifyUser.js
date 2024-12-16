const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "failed",
      message: "Unauthorized: Missing or malformed token",
    });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.jwt_salt);
    req.user = { uid: decodedToken.id }; // Attach user ID (or UID) to the request object
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({
      status: "failed",
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

module.exports = verifyToken;
