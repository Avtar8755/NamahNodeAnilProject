const express = require("express");
const router = express.Router();
const Enquiry = require("../models/Enquiry");
const moment = require("moment-timezone");
const Customer = require("../models/Customer");



router.post("/create", async (req, res) => {
  try {
    const enquiry = new Enquiry(req.body);
    await enquiry.save();

    res.json({
      status: true,
      message: "Enquiry created",
      data: enquiry
    });

  } catch (err) {
    res.json({
      status: false,
      message: err.message
    });
  }
});



router.put("/update-status/:id", async (req, res) => {
  try {
    const { status } = req.body;

    /// 🔥 UPDATE ENQUIRY
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!enquiry) {
      return res.json({
        status: false,
        message: "Enquiry not found",
      });
    }

    /// 🔥 NORMALIZE STATUS
    const currentStatus = status?.toString().toLowerCase();

    /// 🚀 AUTO CREATE CUSTOMER
    if (currentStatus === "done") {

      console.log("🔥 Creating customer from enquiry:", enquiry._id);

      /// safe phone
      const phone = enquiry.phone || "";

      /// duplicate check
      const exists = await Customer.findOne({ phone });

      
        const newCustomer = await Customer.create({
          company: enquiry.company || "",
          address: enquiry.address || "",
          work: enquiry.work || "",

          contact: enquiry.person || "",
          phone: phone,
          email: enquiry.email || "",

          totalAmount: "0",
          amountStatus: "Pending",

          refBy: enquiry.refBy || "",
          refMobile: enquiry.refMobile || "",

          remark: "Auto created from enquiry",

          createdAt: moment()
            .tz("Asia/Kolkata")
            .format("YYYY-MM-DD HH:mm:ss"),
        });

        console.log("✅ Customer created:", newCustomer._id);
      
    }

    res.json({
      status: true,
      message: "Enquiry updated",
      data: enquiry,
    });

  } catch (err) {
    console.log("❌ ERROR:", err);
    res.json({
      status: false,
      message: err.message,
    });
  }
});

router.get("/list", async (req, res) => {
  try {
    const data = await Enquiry.find().sort({ createdAt: -1 });

    const formatted = data.map(e => ({
      ...e._doc,

      /// 🔥 IST format
      createdAtIST: moment(e.createdAt)
        .tz("Asia/Kolkata")
        .format("DD-MM-YYYY hh:mm A")
    }));

    res.json({
      status: true,
      data: formatted
    });

  } catch (err) {
    res.json({
      status: false,
      message: err.message
    });
  }
});


router.put("/update/:id", async (req, res) => {
  try {
    const updated = await Enquiry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      status: true,
      message: "Updated",
      data: updated
    });

  } catch (err) {
    res.json({
      status: false,
      message: err.message
    });
  }
});

module.exports = router;