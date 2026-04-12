const mongoose = require("mongoose");
const moment = require("moment-timezone")

const expenseSchema = new mongoose.Schema({
  name: String,
  shop: String,
  number: String,
  item: String,
  amount: String,
  remark: String,
  status: String,

  /// 🔥 IST time direct
      createdAt: {
      type: String,
      default: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
    },
    updatedAt: {
      type: String,
      default: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
    },

});

module.exports = mongoose.model("Expense", expenseSchema);