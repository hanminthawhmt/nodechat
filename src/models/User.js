const mongoose = require("mongoose");

// defining the schema for user documents in MongoDB
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

// create a model based on that schema which allows to perform CRUD operations on users in the database
module.exports = mongoose.model("User", userSchema);
