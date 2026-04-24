const mongoose = require("mongoose");
const moment = require("moment-timezone");

const errorSchema = new mongoose.Schema({
  errorName: String,
  solution: String,

errorPhotos: [String],
solutionPhotos: [String],

  createdAt: {
    type: String,
    default: () =>
      moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
  },
});

module.exports = mongoose.model("ErrorSolution", errorSchema);