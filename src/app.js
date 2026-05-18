const express = require("express");
const router = express.Router();
const errorHandler = require("./middleware/errorhandler");
const connectDB = require("./config/db");
const app = express();
connectDB();
app.use(express.json());
app.use(errorHandler);

module.exports = app;
