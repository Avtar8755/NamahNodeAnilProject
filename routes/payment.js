const express = require("express");
const router = express.Router();
const Payment = require("../models/paymentReceived");
const upload = require("../middleware/upload");
const moment = require("moment-timezone");
const cloudinary = require("../config/cloudinary");

/// 🔥 CREATE PAYMENT
router.post(
  "/create",
  upload.fields([
    { name: "transferScreenshots", maxCount: 10 },
    { name: "receivedScreenshots", maxCount: 10 },
  ]),
  async (req, res) => {
    try {

      console.log("FILES:", req.files);

      const payment = new Payment({
        ...req.body,

        remark: req.body.remark || "",

        /// ✅ MULTIPLE CLOUDINARY URLS
        transferScreenshots: req.files["transferScreenshots"]
          ? req.files["transferScreenshots"].map(f => f.path)
          : [],

        receivedScreenshots: req.files["receivedScreenshots"]
          ? req.files["receivedScreenshots"].map(f => f.path)
          : [],
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
    const payments = await Payment.find().sort({ createdAt: -1 });

    const data = payments.map((item) => ({
      ...item._doc,

      /// ✅ DIRECT CLOUDINARY URL (ARRAY)
      transferScreenshots: item.transferScreenshots || [],
      receivedScreenshots: item.receivedScreenshots || [],
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
    { name: "transferScreenshots", maxCount: 10 },
    { name: "receivedScreenshots", maxCount: 10 },
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

      /// 🔥 TEXT UPDATE
      Object.assign(payment, req.body);

      /// ✅ ADD NEW TRANSFER IMAGES
      if (req.files["transferScreenshots"]) {
        payment.transferScreenshots = [
          ...(payment.transferScreenshots || []),
          ...req.files["transferScreenshots"].map(f => f.path),
        ];
      }

      /// ✅ ADD NEW RECEIVED IMAGES
      if (req.files["receivedScreenshots"]) {
        payment.receivedScreenshots = [
          ...(payment.receivedScreenshots || []),
          ...req.files["receivedScreenshots"].map(f => f.path),
        ];
      }

      payment.updatedAt = moment()
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm:ss");

      await payment.save();

      res.json({
        status: true,
        message: "Payment Updated Successfully",
        data: payment,
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

router.delete("/delete-image/:id", async (req, res) => {
  try {
    const { file, type } = req.body;
    // type = "transfer" | "received"

    if (!file) {
      return res.json({ status: false, message: "File missing" });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.json({ status: false, message: "Payment not found" });
    }

    /// 🔥 REMOVE FROM DB
    if (type === "transfer") {
      payment.transferScreenshots =
        (payment.transferScreenshots || []).filter(f => f !== file);
    }

    if (type === "received") {
      payment.receivedScreenshots =
        (payment.receivedScreenshots || []).filter(f => f !== file);
    }

    /// 🔥 DELETE FROM CLOUDINARY
    try {
      const publicId = file
        .split("/upload/")[1]
        .split("/")
        .slice(1)
        .join("/")
        .split(".")[0];

      console.log("PUBLIC ID:", publicId);

      const result = await cloudinary.uploader.destroy(publicId);

      console.log("DELETE RESULT:", result);
    } catch (err) {
      console.log("Cloudinary delete error:", err);
    }

    await payment.save();

    res.json({
      status: true,
      message: "Image deleted",
    });

  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
});

module.exports = router;