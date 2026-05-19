const express = require("express");
const router = express.Router();
const errorHandler = require("./middleware/errorhandler");
const connectDB = require("./config/db");
const apiRoutes = require("../src/route/route");
const app = express();
connectDB();
app.use(express.json());
app.use("/api/v1", apiRoutes);
app.use(errorHandler);

module.exports = app;
