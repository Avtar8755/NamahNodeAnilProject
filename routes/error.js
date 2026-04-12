const express = require("express");
const router = express.Router();
const ErrorModel = require("../models/errorSolution");
const upload = require("../middleware/upload");

/// 🔥 CREATE
router.post(
  "/create",
  upload.fields([
    { name: "errorPhoto", maxCount: 1 },
    { name: "solutionPhoto", maxCount: 1 },
  ]),
  async (req, res) => {
    try {

      /// 🔥 SAFE ACCESS
      const errorPhoto = req.files?.errorPhoto
        ? req.files.errorPhoto[0].filename
        : null;

      const solutionPhoto = req.files?.solutionPhoto
        ? req.files.solutionPhoto[0].filename
        : null;

      const data = new ErrorModel({
        errorName: req.body.errorName,
        solution: req.body.solution,

        errorPhoto,
        solutionPhoto,
      });

      await data.save();

      res.json({
        status: true,
        message: "Saved",
        data,
      });

    } catch (err) {
      console.log("ERROR:", err); // 🔥 VERY IMPORTANT

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
    let baseUrl = process.env.BASE_URL;
    if (!baseUrl.endsWith("/")) baseUrl += "/";

    const list = await ErrorModel.find().sort({ createdAt: -1 });

    const data = list.map((e) => ({
      ...e._doc,
      errorPhoto: e.errorPhoto ? baseUrl + e.errorPhoto : null,
      solutionPhoto: e.solutionPhoto
        ? baseUrl + e.solutionPhoto
        : null,
    }));

    res.json({ status: true, data });
  } catch (err) {
    res.json({ status: false, message: err.message });
  }
});

module.exports = router;