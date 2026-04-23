const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const upload = require("../middleware/upload");


router.post(
  "/create",
  upload.array("images", 10), // 🔥 multiple files
  async (req, res) => {
    try {

      const imageFiles = req.files
        ? req.files.map(file => file.filename)
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
    const baseUrl = process.env.BASE_URL;

    const expenses = await Expense.find().sort({ createdAt: -1 });

    /// 🔥 MODIFY DATA
    const data = expenses.map(item => {
      const obj = item.toObject();

      /// images array ko full URL me convert karo
      if (obj.images && obj.images.length > 0) {
        obj.images = obj.images.map(file => baseUrl + file);
      }

      return obj;
    });

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

      /// 🔥 NEW IMAGES
      const newImages = req.files
        ? req.files.map(f => f.filename)
        : [];

      /// 🔥 APPEND (IMPORTANT)
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

module.exports = router;