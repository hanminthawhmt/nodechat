const Message = require("../../models/Message");
const AppError = require("../../utils/AppError");
const { getRoomById, isRoomMember } = require("../rooms/rooms.service");

const saveMessage = async ({ senderId, receiverId, room, content }) => {
  if (!room && !receiverId) {
    throw new AppError("Either room or receiverId is required", 400);
  }
  if (room) {
    const roomDoc = await getRoomById(room);

    if (!isRoomMember(roomDoc, senderId)) {
      throw new AppError("You are not a member of this room", 403);
    }
  }

  const message = await Message.create({
    sender: senderId,
    receiver: receiverId || null,
    room: room || null,
    content,
  });

  return message.populate("sender", "name email");
};

const getMessagesByRoom = async (roomId) => {
  return Message.find({ room: roomId })
    .populate([
      { path: "sender", select: "name email" },
      { path: "receiver", select: "name email" },
    ])
    .sort({ createdAt: 1 }) // asecding order, -1 = descending order
    .limit(50);
};

const getDirectMessages = async (userId, receiverId) => {
  return Message.find({
    // $ne = not equal
    receiver: { $ne: null }, // is a DM
    $or: [
      { sender: userId, receiver: receiverId },
      { sender: receiverId, receiver: userId }, // both directions
    ],
  })
    .populate([
      { path: "sender", select: "name email" },
      { path: "receiver", select: "name email" },
    ])
    .sort({ createdAt: 1 })
    .limit(50);
};

module.exports = { saveMessage, getMessagesByRoom, getDirectMessages };
