const authController = require("./auth.controller");
const router = require("express").Router();

router.post("/register", authController.handleRegister);
router.post("/login", authController.handleLogin);

module.exports = router;
