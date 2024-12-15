const jsonwebtoken = require("jsonwebtoken");

const jwtManager = (user) => {


  if (!process.env.jwt_salt) {
    throw new Error("JWT_SECRET not set in environment variables");
}

  const accessToken = jsonwebtoken.sign(
    {
      id: user.userId,
      name: user.fullName,
      role: user.role,
    },
    process.env.jwt_salt
  );
  return accessToken;
};

module.exports = jwtManager;