const express = require("express");
const path = require("path");
const router = express.Router();
const errorHandler = require("./middleware/errorhandler");
const connectDB = require("./config/db");
const apiRoutes = require("../src/route/route");
const app = express();

connectDB();
app.use(express.json());

const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));

app.use("/api/v1", apiRoutes);

app.get(/.*/, (req, res) => res.sendFile(path.join(publicDir, "index.html")));

app.use(errorHandler);

module.exports = app;
