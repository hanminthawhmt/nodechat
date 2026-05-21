const roomsService = require("./rooms.service");
const { getIO, getOnlineUsers } = require("../../config/socket");

const handleCreateRoom = async (req, res, next) => {
  try {
    const { name, type } = req.body;
    const userId = req.user.id;
    const room = await roomsService.createRoom({
      name: name,
      type: type || "public",
      userId: userId,
    });
    return res.status(201).json({
      status: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetPublicRooms = async (req, res, next) => {
  try {
    const rooms = await roomsService.getPublicRooms();
    return res.status(201).json({
      status: true,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

const handleJoinRoom = async (req, res, next) => {
  try {
    const { id: roomId } = req.params;
    const userId = req.user.id;
    const room = await roomsService.joinRoom({
      roomId: roomId,
      userId: userId,
    });
    return res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

const handleInviteToRoom = async (req, res, next) => {
  try {
    const { id: roomId } = req.params;
    const userId = req.user.id;
    const { inviteeId } = req.body;
    if (!inviteeId)
      return res
        .status(400)
        .json({ success: false, message: "inviteeId is required" });
    const room = await roomsService.inviteToRoom({
      roomId: roomId,
      inviterId: userId,
      inviteeId: inviteeId,
      io: getIO(),
      onlineUsers: getOnlineUsers(),
    });
    return res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCreateRoom,
  handleGetPublicRooms,
  handleJoinRoom,
  handleInviteToRoom,
};
