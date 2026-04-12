const mongoose = require("mongoose");
const moment = require("moment-timezone")

const userSchema = new mongoose.Schema({
  name: String,
  role: {
  type: String,
  enum: ["admin", "agent", "user"],
  default: "user"
},
  email: {
    type: String,
    unique: true
  },
  password: String,
      createdAt: {
      type: String,
      default: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
    },
    updatedAt: {
      type: String,
      default: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
    },
});

module.exports = mongoose.model("User", userSchema);