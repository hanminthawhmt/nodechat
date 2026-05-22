const Room = require("../../models/Room");
const AppError = require("../../utils/AppError");

const createRoom = async ({ name, type, userId }) => {
  const existingRoom = await Room.findOne({ name });
  if (existingRoom) {
    throw new AppError("Room name already taken", 409);
  }
  const room = await Room.create({
    name: name,
    type: type,
    createdBy: userId,
    members: [userId],
  });
  return room;
};

const getPublicRooms = async () => {
  return Room.find({ type: "public" })
    .populate("createdBy", "name email")
    .populate("members", "name email")
    .sort({ createdAt: -1 });
};

const getUserRooms = async (userId) => {
  return Room.find({ members: userId })
    .populate("createdBy", "name email")
    .populate("members", "name email")
    .sort({ createdAt: -1 });
};

const getRoomById = async (roomId) => {
  const room = await Room.findById(roomId)
    .populate("createdBy", "name email")
    .populate("members", "name email");

  if (!room) {
    throw new AppError("Room not found", 404);
  }
  return room;
};

const joinRoom = async ({ roomId, userId }) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new AppError("Room not found", 404);
  }
  if (room.type === "private") {
    throw new AppError("Cannot join a private room without an invite", 403);
  }
  const alreadyAMember = room.members.some(
    (member) => member._id.toString() === userId,
  );
  if (alreadyAMember) {
    throw new AppError("Already a member", 409);
  }
  room.members.push(userId);
  await room.save();
  return room;
};

const inviteToRoom = async ({
  roomId,
  inviterId,
  inviteeId,
  io,
  onlineUsers,
}) => {
  const room = await Room.findById(roomId);
  if (!room) throw new AppError("Room not found", 404);
  const isMember = room.members.some(
    (member) => member._id.toString() === inviterId,
  );
  if (!isMember) throw new AppError("Only members can invite others", 403);
  const alreadyAMember = room.members.some(
    (member) => member._id.toString() === inviteeId,
  );
  if (alreadyAMember) throw new AppError("User is already a member", 409);
  room.members.push(inviteeId);
  await room.save();
  const inviteeSocketId = onlineUsers.get(inviteeId);
  if (inviteeSocketId && io) {
    io.to(inviteeSocketId).emit("user_invited", {
      room: { id: room._id, name: room.name, type: room.type },
    });
  }
  return room;
};

const isRoomMember = (room, userId) => {
  return room.members.some((member) => member._id.toString() === userId);
};

module.exports = {
  createRoom,
  getPublicRooms,
  getUserRooms,
  getRoomById,
  joinRoom,
  inviteToRoom,
  isRoomMember,
};
