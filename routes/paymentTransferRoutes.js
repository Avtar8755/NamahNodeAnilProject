const express = require("express");
const router = express.Router();

const PaymentTransfer = require("../models/paymentTransfer");

const upload = require("../middleware/upload");

const cloudinary = require("../config/cloudinary");

const moment = require("moment-timezone");

/// ======================================
/// CREATE
/// ======================================

router.post(
  "/create",
  upload.array("screenshot", 10),

  async (req, res) => {

    try {

      const screenshots = [];

      /// 🔥 FILES
      if (req.files && req.files.length > 0) {

        req.files.forEach((file) => {

          screenshots.push({

            url: file.path,

            public_id: file.filename,
          });
        });
      }

      /// 🔥 SAVE
      const payment = new PaymentTransfer({

        date: req.body.date,

        accountHolderName:
        req.body.accountHolderName,

        accountTransferName:
        req.body.accountTransferName,

        amount:
        Number(req.body.amount),

        remark:
        req.body.remark,

        screenshots:
        screenshots,
      });

      await payment.save();

      res.json({

        status: true,

        message: "Payment Added",

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

/// ======================================
/// LIST
/// ======================================

router.get("/list", async (req, res) => {

  try {

    const data = await PaymentTransfer.find()
        .sort({ createdAt: -1 });

    let totalAmount = 0;

    data.forEach((e) => {

      const amount = Number(e.amount);

      if (!isNaN(amount)) {

        totalAmount += amount;
      }
    });

    res.json({

      status: true,

      totalAmount,

      data,
    });

  } catch (err) {

    res.json({

      status: false,

      message: err.message,
    });
  }
});

/// ======================================
/// UPDATE
/// ======================================

router.put(
  "/update/:id",

  upload.array("screenshot", 10),

  async (req, res) => {

    try {

      const payment =
          await PaymentTransfer.findById(
            req.params.id,
          );

      if (!payment) {

        return res.json({

          status: false,

          message: "Data not found",
        });
      }

      /// 🔥 UPDATE DATA
      payment.date =
          req.body.date;

      payment.accountHolderName =
          req.body.accountHolderName;

      payment.accountTransferName =
          req.body.accountTransferName;

      payment.amount =
          Number(req.body.amount);

      payment.remark =
          req.body.remark;

      /// ======================================
      /// NEW IMAGES
      /// ======================================

      if (req.files && req.files.length > 0) {

        /// DELETE OLD CLOUDINARY IMAGES
        if (payment.screenshots?.length > 0) {

          for (const img of payment.screenshots) {

            await cloudinary.uploader.destroy(
              img.public_id,
            );
          }
        }

        /// EMPTY OLD ARRAY
        payment.screenshots = [];

        /// ADD NEW IMAGES
        req.files.forEach((file) => {

          payment.screenshots.push({

            url: file.path,

            public_id: file.filename,
          });
        });
      }

      /// UPDATED TIME
      payment.updatedAt = moment()
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD HH:mm:ss");

      await payment.save();

      res.json({

        status: true,

        message: "Updated Successfully",

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

/// ======================================
/// DELETE FULL PAYMENT
/// ======================================

router.delete(
  "/delete/:id",

  async (req, res) => {

    try {

      const payment =
          await PaymentTransfer.findById(
            req.params.id,
          );

      if (!payment) {

        return res.json({

          status: false,

          message: "Data not found",
        });
      }

      /// 🔥 DELETE CLOUDINARY IMAGES
      if (payment.screenshots?.length > 0) {

        for (const img of payment.screenshots) {

          await cloudinary.uploader.destroy(
            img.public_id,
          );
        }
      }

      /// 🔥 DELETE DB DATA
      await PaymentTransfer.findByIdAndDelete(
        req.params.id,
      );

      res.json({

        status: true,

        message: "Deleted Successfully",
      });

    } catch (err) {

      res.json({

        status: false,

        message: err.message,
      });
    }
  }
);

/// ======================================
/// DELETE SINGLE IMAGE
/// ======================================

router.delete(
  "/delete-image/:id/:imageId",

  async (req, res) => {

    try {

      const payment =
          await PaymentTransfer.findById(
            req.params.id,
          );

      if (!payment) {

        return res.json({

          status: false,

          message: "Payment not found",
        });
      }

      /// 🔥 FIND IMAGE
      const image =
          payment.screenshots.id(
            req.params.imageId,
          );

      if (!image) {

        return res.json({

          status: false,

          message: "Image not found",
        });
      }

      /// 🔥 DELETE FROM CLOUDINARY
      await cloudinary.uploader.destroy(
        image.public_id,
      );

      /// 🔥 REMOVE FROM ARRAY
      payment.screenshots.pull(
        req.params.imageId,
      );

      await payment.save();

      res.json({

        status: true,

        message: "Image Deleted Successfully",
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