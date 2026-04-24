const express = require("express");
const router = express.Router();
const ErrorModel = require("../models/errorSolution");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary")

/// 🔥 CREATE
router.post(
  "/create",
  upload.fields([
    { name: "errorPhotos", maxCount: 10 },
    { name: "solutionPhotos", maxCount: 10 },
  ]),
  async (req, res) => {
    try {

      console.log("FILES:", req.files);

      const data = new ErrorModel({
        errorName: req.body.errorName,
        solution: req.body.solution,

        /// ✅ MULTIPLE CLOUDINARY URL
        errorPhotos: req.files["errorPhotos"]
          ? req.files["errorPhotos"].map(f => f.path)
          : [],

        solutionPhotos: req.files["solutionPhotos"]
          ? req.files["solutionPhotos"].map(f => f.path)
          : [],
      });

      await data.save();

      res.json({
        status: true,
        message: "Saved",
        data,
      });

    } catch (err) {
      console.log("ERROR:", err);

      res.status(500).json({
        status: false,
        message: err.message,
      });
    }
  }
);

/// 🔥 LIST
router.get("/list", async (req, res) => {
  try {
    const list = await ErrorModel.find().sort({ createdAt: -1 });

    const data = list.map((e) => ({
      ...e._doc,

      /// ✅ MULTIPLE FILES (DIRECT URL)
      errorPhotos: e.errorPhotos || [],
      solutionPhotos: e.solutionPhotos || [],
    }));

    res.json({ status: true, data });

  } catch (err) {
    res.json({ status: false, message: err.message });
  }
});

router.delete("/delete-image/:id", async (req, res) => {
  try {
    const { file, type } = req.body;

    const data = await ErrorModel.findById(req.params.id);

    if (!data) {
      return res.json({ status: false, message: "Not found" });
    }

    /// 🔥 REMOVE FROM DB
    if (type === "error") {
      data.errorPhotos = (data.errorPhotos || []).filter(f => f !== file);
    }

    if (type === "solution") {
      data.solutionPhotos = (data.solutionPhotos || []).filter(f => f !== file);
    }

    /// 🔥 DELETE FROM CLOUDINARY
    const publicId = file
      .split("/upload/")[1]
      .split("/")
      .slice(1)
      .join("/")
      .split(".")[0];

    await cloudinary.uploader.destroy(publicId);

    await data.save();

    res.json({ status: true, message: "Deleted" });

  } catch (err) {
    res.json({ status: false, message: err.message });
  }
});

module.exports = router;