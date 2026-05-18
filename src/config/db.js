const { MONGO_URI } = require("./env");
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    next(error);
  }
};

module.exports = connectDB;
