const Message = require("../../models/Message");
const User = require("../../models/User");
const AppError = require("../../utils/AppError");

const getDMConversations = async (userId) => {
  const messages = await Message.find({
    $or: [
      { sender: userId, receiver: { $exists: true, $ne: null } },
      { receiver: userId, room: null }
    ],
  })
    .populate("sender", "id name email")
    .populate("receiver", "id name email")
    .sort({ createdAt: -1 });

  if (!messages.length) return [];

  // Extract unique conversation partners
  const partnersMap = new Map();
  messages.forEach((msg) => {
    const partner = msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
    const partnerId = partner._id.toString();
    if (!partnersMap.has(partnerId)) {
      partnersMap.set(partnerId, {
        id: partner._id,
        name: partner.name,
        email: partner.email,
      });
    }
  });

  return Array.from(partnersMap.values());
};

const startDMConversation = async (userId, targetUserId) => {
  if (userId === targetUserId) {
    throw new AppError("Cannot start DM with yourself", 400);
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  return {
    id: targetUser._id,
    name: targetUser.name,
    email: targetUser.email,
  };
};

module.exports = {
  getDMConversations,
  startDMConversation,
};
