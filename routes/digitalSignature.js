const express = require("express");
const router = express.Router();
const DSC = require("../models/digital_signature");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

/// 🔥 CREATE
router.post(
  "/create",
  upload.array("documentFiles", 10),
  async (req, res) => {
    try {

      console.log("FILES:", req.files);

      const data = new DSC({
        ...req.body,

        /// ✅ MULTIPLE CLOUDINARY URL
        documentFiles: req.files
          ? req.files.map(file => file.path)
          : [],
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
    const list = await DSC.find().sort({ createdAt: -1 });

    const data = list.map((e) => ({
      ...e._doc,

      /// ✅ MULTIPLE FILES (DIRECT URL)
      documentFiles: e.documentFiles || [],
    }));

    res.json({ status: true, data });

  } catch (err) {
    res.json({ status: false, message: err.message });
  }
});



router.delete("/delete-file/:id", async (req, res) => {
  try {
    const { file } = req.body; // full URL

    if (!file) {
      return res.json({ status: false, message: "File missing" });
    }

    const dsc = await DSC.findById(req.params.id);

    if (!dsc) {
      return res.json({ status: false, message: "Record not found" });
    }

    /// 🔥 REMOVE FROM DB
    dsc.documentFiles = (dsc.documentFiles || []).filter(
      (f) => f !== file
    );

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
      console.log("Cloudinary error:", err);
    }

    await dsc.save();

    res.json({
      status: true,
      message: "File deleted",
    });

  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
});

module.exports = router;