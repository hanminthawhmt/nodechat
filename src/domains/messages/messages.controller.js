const messagesService = require("./messages.service");

const handleGetMessages = async (req, res, next) => {
  try {
    const { room, receiverId } = req.query;

    if (!room && !receiverId) {
      return res.status(400).json({
        success: false,
        message: "Either room or receiverId is required",
      });
    }

    const message = room
      ? await messagesService.getMessagesByRoom(room)
      : await messagesService.getDirectMessages(req.user.id, receiverId);

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleGetMessages };
