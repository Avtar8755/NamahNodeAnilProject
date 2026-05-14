const mongoose = require("mongoose");
const moment = require("moment-timezone");

const paymentTransferSchema = new mongoose.Schema({

  paymentReceived: {
    type: String,
    default: "PAYMENT Transfer",
  },

  date: String,

  accountHolderName: String,

  accountTransferName: String,

  amount: String,

screenshots: [
  {
    url: String,
    public_id: String,
  },
],

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

module.exports = mongoose.model(
  "PaymentTransfer",
  paymentTransferSchema
);