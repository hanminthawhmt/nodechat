const usersService = require("./users.service");

const handleFindUserByEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    const user = await usersService.findUserByEmail(email, req.user.id);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const handleGetUsersList = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const usersList = await usersService.list(currentUserId);
    res.status(200).json({
      success: true,
      results: usersList.length,
      data: usersList,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleFindUserByEmail, handleGetUsersList };
