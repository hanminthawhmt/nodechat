const express = require("express");
const path = require("path");
const router = express.Router();
const errorHandler = require("./middleware/errorhandler");
const connectDB = require("./config/db");
const apiRoutes = require("../src/route/route");
const verifyToken = require("./middleware/VerifyToken");
const app = express();

connectDB();
app.use(express.json());
app.use(verifyToken);
app.use("/api/v1", apiRoutes);

const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));
app.get("/", (req, res) => res.sendFile(path.join(publicDir, "index.html")));

app.use(errorHandler);

module.exports = app;
