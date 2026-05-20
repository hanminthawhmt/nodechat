const messagesController = require("./messages.controller");
const router = require("express").Router();

router.get("/messages", messagesController.handleGetMessages);

module.exports = router;
