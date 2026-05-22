const dmsController = require("./dms.controller");
const router = require("express").Router();
const verifyToken = require("../../middleware/VerifyToken");

router.use(verifyToken);
router.get("/", dmsController.handleGetDMConversations);
router.post("/:targetUserId", dmsController.handleStartDMConversation);

module.exports = router;
