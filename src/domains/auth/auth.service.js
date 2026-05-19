const User = require("../../models/User");
const AppError = require("../../utils/AppError");
const bcrypt = require("bcrypt");
const { SALT, JWT_SECRET, EXPIRES_IN } = require("../../config/env");
const jwt = require("jsonwebtoken");

const registerUser = async (data) => {
  const { name, email, password } = data;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already in use", 409);
  }
  const salt = await bcrypt.genSalt(Number(SALT));
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({ name, email, password: hashedPassword });

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: EXPIRES_IN },
  );
  return { user, token };
};

const loginUser = async (data) => {
  const { email, password } = data;
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid email", 401);
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: EXPIRES_IN },
  );
  return { user, token };
};

module.exports = { registerUser, loginUser };
