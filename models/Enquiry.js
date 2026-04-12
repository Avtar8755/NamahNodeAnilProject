const mongoose = require("mongoose");
const moment = require("moment-timezone");

const enquirySchema = new mongoose.Schema({
  company: String,
  address: String,
  work: String,
  person: String,
  phone: String,
  email: String,
  refBy: String,
  refMobile: String,
  status: {
    type: String,
    default: "Pending"
  },
  category: {
    type: String,
    default: "CHA"
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
      createdAt: {
      type: String,
      default: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
    },
    updatedAt: {
      type: String,
      default: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
    },
},);

module.exports = mongoose.model("Enquiry", enquirySchema);