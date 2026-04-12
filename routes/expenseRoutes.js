const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");


router.post("/create", async (req, res) => {
  try {
    const expense = new Expense(req.body);
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
});


/// ✅ LIST
router.get("/list", async (req, res) => {
  try {
    const data = await Expense.find().sort({ createdAt: -1 });

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

module.exports = router;