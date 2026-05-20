const Message = require("../../models/Message");
const AppError = require("../../utils/AppError");

const saveMessage = async ({ senderId, receiverId, room, content }) => {
  if (!room && !receiverId) {
    throw new AppError("Either room or receiverId is required", 400);
  }

  const message = await Message.create({
    sender: senderId,
    receiver: receiverId || null,
    room: room || null,
    content,
  });

  return message.populate("sender", "name email");
};

const getMessagesByRoom = async (room) => {
  return Message.find({ room })
    .populate("sender", "name email")
    .sort({ createdAt: 1 })
    .limit(50);
};

const getDirectMessages = async (userId, receiverId) => {
  return Message.find({
    receiver: { $ne: null }, // is a DM
    $or: [
      { sender: userId, receiver: receiverId },
      { sender: receiverId, receiver: userId }, // both directions
    ],
  })
    .populate("sender", "name email")
    .sort({ createdAt: 1 })
    .limit(50);
};

module.exports = { saveMessage, getMessagesByRoom, getDirectMessages };
