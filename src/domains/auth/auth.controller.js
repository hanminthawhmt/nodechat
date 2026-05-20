const authService = require("./auth.service");
const handleRegister = async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.password || !req.body.name) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }
    const { user, token } = await authService.registerUser(req.body);
    return res.status(201).json({
      success: true,
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleLogin = async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required to log in.",
      });
    }
    const { user, token } = await authService.loginUser(req.body, req.header);
    return res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

const handleGetUsersList = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const usersList = await authService.list(currentUserId);
    res.status(200).json({
      success: true,
      results: usersList.length,
      data: usersList,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleRegister, handleLogin, handleGetUsersList };
