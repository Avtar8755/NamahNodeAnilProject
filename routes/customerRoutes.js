const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const upload = require("../middleware/upload");
const moment = require("moment-timezone");
const cloudinary = require("../config/cloudinary");

router.post(
  "/create",
  upload.fields([
    { name: "officerImage", maxCount: 10 },
    { name: "documentFile", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      console.log("FILES:", req.files);

      const customer = new Customer({
        ...req.body,

        /// ✅ CLOUDINARY URL SAVE
        officerImages: req.files["officerImage"]
          ? req.files["officerImage"].map(file => file.path)
          : [],

        documentFiles: req.files["documentFile"]
          ? req.files["documentFile"].map(file => file.path)
          : [],

        createdAt: moment()
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD HH:mm:ss"),
      });

      await customer.save();

      res.json({
        status: true,
        message: "Customer created",
        data: customer,
      });

    } catch (err) {
      console.log(err);
      res.json({
        status: false,
        message: err.message,
      });
    }
  }
);

module.exports = router;
router.get("/list", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    const data = customers.map((item) => ({
      ...item._doc,

      /// ✅ DIRECT URL (Cloudinary)
      officerImages: item.officerImages || [],
      documentFiles: item.documentFiles || [],
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
/// ✅ LIST CUSTOMER
// router.get("/list", async (req, res) => {
//   try {
//     const data = await Customer.find().sort({ createdAt: -1 });

//     res.json({
//       status: true,
//       data,
//     });
//   } catch (err) {
//     res.json({
//       status: false,
//       message: err.message,
//     });
//   }
// });
router.get("/stats", async (req, res) => {
  try {
    const customers = await Customer.find();
    const expenses = await Expense.find();

    let pending = 0;
    let completed = 0;
    let totalAmount = 0;
    let officerPayment = 0;
    let totalExpense = 0;

    /// 🔥 CUSTOMER DATA
    customers.forEach(c => {
      const amount = Number(c.totalAmount || 0);
      const officerAmt = Number(c.officerAmount || 0);

      totalAmount += amount;

      if (c.amountStatus === "Pending") {
        pending += amount;
      }

      if (c.amountStatus === "Done") {
        completed += amount;
      }

      /// ✅ OFFICER PAYMENT (only Paid)
      if (c.officerStatus === "Paid") {
        officerPayment += officerAmt;
      }
    });

    /// 🔥 EXPENSE DATA
    expenses.forEach(e => {
      const amt = Number(e.amount || 0);

      /// optional filter
      if (e.status === "Paid" || e.status == null) {
        totalExpense += amt;
      }
    });

    res.json({
      status: true,
      data: {
        pending,
        completed,
        totalAmount,
        officerPayment,
        totalExpense,
      }
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
    const { status, workStatus } = req.body;

    const updateData = {
      updatedAt: moment()
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm:ss"),
    };

    if (status) {
      updateData.amountStatus = status;
    }

    if (workStatus) {
      updateData.workStatus = workStatus;
    }

    const data = await Customer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      status: true,
      message: "Updated",
      data,
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
});

router.put(
  "/update/:id",
  upload.fields([
    { name: "officerImages", maxCount: 10 },
    { name: "documentFiles", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id);

      if (!customer) {
        return res.json({ status: false, message: "Customer not found" });
      }

      Object.assign(customer, req.body);

      /// ✅ ADD NEW IMAGES
      if (req.files["officerImages"]) {
        customer.officerImages = [
          ...(customer.officerImages || []),
          ...req.files["officerImages"].map(f => f.path),
        ];
      }

      if (req.files["documentFiles"]) {
        customer.documentFiles = [
          ...(customer.documentFiles || []),
          ...req.files["documentFiles"].map(f => f.path),
        ];
      }

      customer.updatedAt = moment()
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm:ss");

      await customer.save();

      res.json({
        status: true,
        message: "Customer updated",
        data: customer,
      });

    } catch (err) {
      res.json({ status: false, message: err.message });
    }
  }
);
// ✅ GET UNIQUE COMPANY LIST
router.get("/company-list", async (req, res) => {
  try {
    const data = await Customer.aggregate([
      {
        $match: {
          company: { $ne: null, $ne: "" }, // empty remove
        },
      },
      {
        $group: {
          _id: "$company",
          address: { $first: "$address" },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          address: 1,
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

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



router.delete("/delete-file/:id", async (req, res) => {
  try {
    const { file, type } = req.body;

    console.log("REQ BODY:", req.body);

    if (!file) {
      return res.json({
        status: false,
        message: "File URL missing",
      });
    }

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.json({ status: false, message: "Customer not found" });
    }

    /// 🔥 REMOVE FROM DB
    if (type === "officer") {
      customer.officerImages = (customer.officerImages || []).filter(
        (f) => f !== file
      );
    }

    if (type === "document") {
      customer.documentFiles = (customer.documentFiles || []).filter(
        (f) => f !== file
      );
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

    await customer.save();

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