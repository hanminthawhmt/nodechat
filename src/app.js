const express = require("express");
const path = require("path");
const router = express.Router();
const errorHandler = require("./middleware/errorhandler");
const connectDB = require("./config/db");
const apiRoutes = require("../src/route/route");
const { SESSION_SECRET } = require("./config/env");
const session = require("express-session");
const passport = require("./config/passport");
const app = express();

connectDB();
app.use(express.json());

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));

app.use("/api/v1", apiRoutes);

app.get(/.*/, (req, res) => res.sendFile(path.join(publicDir, "index.html")));

app.use(errorHandler);

module.exports = app;
