const authRoute = require("../domains/auth/auth.route");
const messagesRoute = require("../domains/messages/messages.route");
const router = require("express").Router();

router.use("/auth", authRoute);
router.use("/messages", messagesRoute);

module.exports = router;
