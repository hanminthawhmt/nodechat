const dmsService = require("./dms.service");

const handleGetDMConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversations = await dmsService.getDMConversations(userId);
    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

const handleStartDMConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;
    const contact = await dmsService.startDMConversation(userId, targetUserId);
    return res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleGetDMConversations,
  handleStartDMConversation,
};
