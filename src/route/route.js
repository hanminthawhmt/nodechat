const authRoute = require("../domains/auth/auth.route");
const messagesRoute = require("../domains/messages/messages.route");
const roomsRoute = require("../domains/rooms/rooms.route");
const usersRoute = require("../domains/users/users.route");
const router = require("express").Router();

router.use("/auth", authRoute);
router.use("/messages", messagesRoute);
router.use("/rooms", roomsRoute);
router.use("/users", usersRoute);

module.exports = router;
