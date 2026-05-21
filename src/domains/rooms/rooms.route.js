const roomsController = require("./rooms.controller");
const router = require("express").Router();

router.post("/", roomsController.handleCreateRoom);
router.get("/", roomsController.handleGetPublicRooms);
router.post("/:id/join", roomsController.handleJoinRoom);
router.post("/:id/invite", roomsController.handleInviteToRoom);

module.exports = router;
