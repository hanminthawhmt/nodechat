const messagesController = require("./messages.controller");
const router = require("express").Router();
const verifyToken = require("../../middleware/VerifyToken");

router.use(verifyToken);
router.get("/", messagesController.handleGetMessages);

module.exports = router;
