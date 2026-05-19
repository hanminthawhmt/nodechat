const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const { JWT_SECRET } = require("../config/env");

const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer")) {
    return next(new AppError("No token provided", 401));
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired, please login again", 401));
    }
    return next(new AppError("Invalid token", 401));
  }
};

module.exports = verifyToken;
