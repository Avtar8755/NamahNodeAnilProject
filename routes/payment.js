const express = require("express");
const router = express.Router();
const Payment = require("../models/paymentReceived");
const upload = require("../middleware/upload");
const moment = require("moment-timezone");

/// 🔥 CREATE PAYMENT
router.post(
  "/create",
  upload.fields([
    { name: "transferScreenshot", maxCount: 1 },
    { name: "receivedScreenshot", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const payment = new Payment({
        ...req.body,

        transferScreenshot: req.files["transferScreenshot"]
          ? req.files["transferScreenshot"][0].filename
          : null,

        receivedScreenshot: req.files["receivedScreenshot"]
          ? req.files["receivedScreenshot"][0].filename
          : null,
      });

      await payment.save();

      res.json({
        status: true,
        message: "Payment saved",
        data: payment,
      });
    } catch (err) {
      res.json({
        status: false,
        message: err.message,
      });
    }
  }
);

/// 🔥 LIST PAYMENT
router.get("/list", async (req, res) => {
  try {
    let baseUrl = process.env.BASE_URL || "";

    /// 🔥 ensure slash at end
    if (!baseUrl.endsWith("/")) {
      baseUrl = baseUrl + "/";
    }

    const payments = await Payment.find().sort({ createdAt: -1 });

    const data = payments.map((item) => ({
      ...item._doc,

      transferScreenshot: item.transferScreenshot
        ? baseUrl + item.transferScreenshot
        : null,

      receivedScreenshot: item.receivedScreenshot
        ? baseUrl + item.receivedScreenshot
        : null,
    }));

    res.json({
      status: true,
      data,
    });

  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
});

/// 🔥 DELETE (optional)
router.delete("/delete/:id", async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);

    res.json({
      status: true,
      message: "Deleted",
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
});

router.post(
  "/update/:id",
  upload.fields([
    { name: "transferScreenshot", maxCount: 1 },
    { name: "receivedScreenshot", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.id);

      if (!payment) {
        return res.json({
          status: false,
          message: "Payment not found",
        });
      }

      /// 🔥 TEXT UPDATE (safe fields only)
      payment.date = req.body.date || payment.date;
      payment.company = req.body.company || payment.company;
      payment.receiverName =
        req.body.receiverName || payment.receiverName;
      payment.receivedAmount =
        req.body.receivedAmount || payment.receivedAmount;
      payment.paymentMode =
        req.body.paymentMode || payment.paymentMode;
      payment.transferTo =
        req.body.transferTo || payment.transferTo;
      payment.transferAmount =
        req.body.transferAmount || payment.transferAmount;

      /// 📸 FILE UPDATE (ONLY if new file comes)
      if (req.files?.transferScreenshot?.length > 0) {
        payment.transferScreenshot =
          req.files.transferScreenshot[0].filename;
      }

      if (req.files?.receivedScreenshot?.length > 0) {
        payment.receivedScreenshot =
          req.files.receivedScreenshot[0].filename;
      }

      /// 🕒 UPDATE TIME
      payment.updatedAt = moment()
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm:ss");

      await payment.save();

      /// 🔥 BASE URL (for frontend)
      let baseUrl = process.env.BASE_URL || "";
      if (!baseUrl.endsWith("/")) baseUrl += "/";

      const responseData = {
        ...payment._doc,
        transferScreenshot: payment.transferScreenshot
          ? baseUrl + payment.transferScreenshot
          : null,
        receivedScreenshot: payment.receivedScreenshot
          ? baseUrl + payment.receivedScreenshot
          : null,
      };

      res.json({
        status: true,
        message: "Payment Updated Successfully",
        data: responseData,
      });

    } catch (err) {
      console.log("UPDATE ERROR:", err);

      res.status(500).json({
        status: false,
        message: err.message,
      });
    }
  }
);

module.exports = router;