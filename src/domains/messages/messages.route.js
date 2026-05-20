const messagesController = require("./messages.controller");
const router = require("express").Router();

router.get("/", messagesController.handleGetMessages);

module.exports = router;
