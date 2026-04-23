const mongoose = require("mongoose");
const moment = require("moment-timezone");

const customerSchema = new mongoose.Schema({
  company: String,
  date: String,
  address: String,
  work: String,

  contact: String,
  phone: String,
  email: String,

  totalAmount: String,
  amountStatus: String,
  workStatus: String,

  refBy: String,
  refMobile: String,
  refAmount: String,
  refStatus: String,

  officerName: String,
  officerAmount: String,
  officerStatus: String,

  remark: String,

  /// 🔥 FILE PATHS
  officerImages: [String],
  documentFiles: [String],

  /// 🕒 IST TIME
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

module.exports = mongoose.model("Customer", customerSchema);