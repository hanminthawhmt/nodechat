const User = require("../../models/User");
const AppError = require("../../utils/AppError");

const findUserByEmail = async (email, userId) => {
  const user = await User.findOne({ email }).select("name email _id");
  if (!user) throw new AppError("User not found", 404);
  if (user._id.toString() === requesterId.toString()) {
    throw new AppError("That's you!", 400);
  }
  return user;
};

const list = async (userId) => {
  const user = await User.find({
    _id: { $ne: userId },
  }).select("name email");
  if (!user) {
    throw new Error(new AppError("User not found", 404));
  }
  return user;
};

module.exports = { findUserByEmail, list };
