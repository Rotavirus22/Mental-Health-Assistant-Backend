const jsonwebtoken = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    // accessToken

    const accessToken = req.headers.authorization.replace("Bearer", "").trim();

    //payload verification

    const jwt_payload = jsonwebtoken.verify(accessToken, process.env.jwt_salt);

    //creating user of jwt request which is equal to jwt payload
    req.user = jwt_payload;
  } catch (e) {
    res.status(401).json({
      status: "failed",
      message: "UnAuthorized !",
    });
    return;
  }
  next();
};

module.exports = auth;