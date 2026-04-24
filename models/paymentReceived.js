const mongoose = require("mongoose");
const moment = require("moment-timezone");

const paymentSchema = new mongoose.Schema({
  date: String,
  company: String,

  receiverName: String,
  receivedAmount: String,
  paymentMode: String,

  transferTo: String,
  transferAmount: String,
  remark: String,

  /// 📸 FILES
transferScreenshots: [String],
receivedScreenshots: [String],

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

module.exports = mongoose.model("PaymentReceived", paymentSchema);