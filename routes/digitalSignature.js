const express = require("express");
const router = express.Router();
const DSC = require("../models/digital_signature");
const upload = require("../middleware/upload");

/// 🔥 CREATE
router.post(
  "/create",
  upload.single("documentFile"),
  async (req, res) => {
    try {
      const data = new DSC({
        ...req.body,
        documentFile: req.file ? req.file.filename : null,
      });

      await data.save();

      res.json({
        status: true,
        message: "Saved",
        data,
      });
    } catch (err) {
      res.json({ status: false, message: err.message });
    }
  }
);

/// 🔥 LIST
router.get("/list", async (req, res) => {
  try {
    let baseUrl = process.env.BASE_URL;

    if (!baseUrl.endsWith("/")) baseUrl += "/";

    const list = await DSC.find().sort({ createdAt: -1 });

    const data = list.map((e) => ({
      ...e._doc,
      documentFile: e.documentFile
        ? baseUrl + e.documentFile
        : null,
    }));

    res.json({ status: true, data });
  } catch (err) {
    res.json({ status: false, message: err.message });
  }
});

module.exports = router;