const usersController = require("./users.controller");
const router = require("express").Router();

router.get("/search", usersController.handleFindUserByEmail);
router.get("/", usersController.handleGetUsersList);

module.exports = router;
