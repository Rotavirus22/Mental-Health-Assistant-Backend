const jsonwebtoken = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
  try {
    // Extract the access token from the Authorization header
    const accessToken = req.headers.authorization.replace("Bearer", "").trim();

    // Verify the payload of the JWT token
    const jwt_payload = jsonwebtoken.verify(accessToken, process.env.jwt_salt);

    // Check if the user has the admin role
    if (jwt_payload.role !== "admin") {
      return res.status(403).json({
        status: "failed",
        message: "Access denied. Admins only.",
      });
    }

    // Attach the user data to the request object
    req.user = jwt_payload;
  } catch (e) {
    res.status(401).json({
      status: "failed",
      message: "Unauthorized. Invalid or expired token.",
    });
    return;
  }

  next();
};

module.exports = adminAuth;
