const authController = require("./auth.controller");
const router = require("express").Router();
const passport = require("../../config/passport");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../config/env");

router.post("/register", authController.handleRegister);
router.post("/login", authController.handleLogin);
// redirect to google consent screen
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
// Google redirects back here after user approves
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/?error=google_failed",
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    const user = JSON.stringify({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    });

    res.redirect(`/?token=${token}&user=${encodeURIComponent(user)}`);
  },
);

module.exports = router;
