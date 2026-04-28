const mongoose = require("mongoose");
const moment = require("moment-timezone");

const serviceSchema = new mongoose.Schema({
  name: String,
  validity: String,
  renewal: String,

  govFees: String,
  officerFees: String,
  professionalFees: String,

  requirementDocuments: [String],
  certificateIssueTime: String,

formatFiles: [
  {
    url: String,
    public_id: String,
  }
],

govNotificationFiles: [
  {
    url: String,
    public_id: String,
  }
],

  remark: String,
  message: String,

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

module.exports = mongoose.model("Service", serviceSchema);