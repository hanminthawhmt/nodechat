const express = require("express");
const app = express();
const router = express.Router();
const errorHandler = require("./middleware/errorhandler");
app.use(express.json());
app.use(errorHandler);

module.exports = app;
