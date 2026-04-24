const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary")


router.post(
  "/create",
  upload.array("images", 10), // multiple files
  async (req, res) => {
    try {

      console.log("FILES:", req.files);

      /// ✅ CLOUDINARY URL SAVE
      const imageFiles = req.files
        ? req.files.map(file => file.path)
        : [];

      const expense = new Expense({
        ...req.body,
        images: imageFiles,
      });

      await expense.save();

      res.json({
        status: true,
        message: "Expense created",
        data: expense
      });

    } catch (err) {
      res.json({
        status: false,
        message: err.message
      });
    }
  }
);


/// ✅ LIST
router.get("/list", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });

    const data = expenses.map(item => ({
      ...item.toObject(),

      /// ✅ DIRECT URL (Cloudinary)
      images: item.images || [],
    }));

    res.json({
      status: true,
      data
    });

  } catch (err) {
    res.json({
      status: false,
      message: err.message
    });
  }
});

router.put(
  "/update/:id",
  upload.array("images", 10),
  async (req, res) => {
    try {
      const expense = await Expense.findById(req.params.id);

      if (!expense) {
        return res.json({ status: false, message: "Not found" });
      }

      /// 🔥 TEXT UPDATE
      Object.assign(expense, req.body);

      /// ✅ NEW IMAGES (Cloudinary URL)
      const newImages = req.files
        ? req.files.map(f => f.path)
        : [];

      /// 🔥 APPEND
      expense.images = [
        ...(expense.images || []),
        ...newImages,
      ];

      await expense.save();

      res.json({
        status: true,
        message: "Updated",
        data: expense,
      });

    } catch (err) {
      res.json({
        status: false,
        message: err.message,
      });
    }
  }
);

router.delete("/delete-image/:id", async (req, res) => {
  try {
    const { file } = req.body; // full Cloudinary URL

    if (!file) {
      return res.json({ status: false, message: "File missing" });
    }

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.json({ status: false, message: "Expense not found" });
    }

    /// 🔥 REMOVE FROM DB
    expense.images = (expense.images || []).filter(f => f !== file);

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

    await expense.save();

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