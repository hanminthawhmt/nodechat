const authController = require("./auth.controller");
const router = require("express").Router();

router.post("/register", authController.handleRegister);

module.exports = router;
