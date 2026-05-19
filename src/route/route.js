const authRoute = require("../domains/auth/auth.route");
const router = require("express").Router();

router.use("/auth", authRoute);

module.exports = router;
