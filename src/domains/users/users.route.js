const usersController = require("./users.controller");
const router = require("express").Router();
const verifyToken = require("../../middleware/VerifyToken");

router.use(verifyToken);
router.get("/search", usersController.handleFindUserByEmail);
router.get("/", usersController.handleGetUsersList);

module.exports = router;
