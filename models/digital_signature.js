const mongoose = require("mongoose");
const moment = require("moment-timezone");

const dscSchema = new mongoose.Schema({
  date: String,
  expiryDate: String,

  classType: String,
  years: String,

  company: String,
  holderName: String,

  category: String,

  documentFile: String,

  status: String,
  remark: String,

  createdAt: {
    type: String,
    default: () =>
      moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
  },
  updatedAt: {
    type: String,
    default: () =>
      moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
  },
});

module.exports = mongoose.model("DigitalSignature", dscSchema);