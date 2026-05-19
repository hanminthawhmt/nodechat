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

module.exports = { handleRegister };
