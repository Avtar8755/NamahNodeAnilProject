const express = require("express");
const router = express.Router();
const Payment = require("../models/paymentReceived");
const upload = require("../middleware/upload");
const moment = require("moment-timezone");
const cloudinary = require("../config/cloudinary");
const Service = require("../models/services");


router.post(
  "/create",
  upload.fields([
    { name: "formatFiles", maxCount: 10 },
    { name: "govNotificationFiles", maxCount: 10 },
  ]),
  async (req, res) => {
    try {

      console.log("BODY 👉", req.body);
      console.log("FILES 👉", req.files);

      /// ✅ SAFE JSON PARSE
      if (req.body.requirementDocuments) {
        try {
          if (typeof req.body.requirementDocuments === "string") {
            req.body.requirementDocuments = JSON.parse(
              req.body.requirementDocuments
            );
          }
        } catch (e) {
          console.log("JSON ERROR 👉", e.message);
          req.body.requirementDocuments = [];
        }
      }

      const service = new Service({
        name: req.body.name,
        validity: req.body.validity,
        renewal: req.body.renewal,
        govFees: req.body.govFees,
        officerFees: req.body.officerFees,
        professionalFees: req.body.professionalFees,
        certificateIssueTime: req.body.certificateIssueTime,
        remark: req.body.remark,
        message: req.body.message,

        requirementDocuments: req.body.requirementDocuments || [],

        formatFiles: req.files && req.files.formatFiles
          ? req.files.formatFiles.map(f => ({
              url: f.path,
              public_id: f.filename,
            }))
          : [],

        govNotificationFiles: req.files && req.files.govNotificationFiles
          ? req.files.govNotificationFiles.map(f => ({
              url: f.path,
              public_id: f.filename,
            }))
          : [],
      });

      await service.save();

      res.json({ status: true, data: service });

    } catch (err) {

      console.log("ERROR MESSAGE 👉", err.message);
      console.log("ERROR STACK 👉", err.stack);

      res.status(500).json({
        status: false,
        message: err.message || "Server Error",
      });
    }
  }
);

router.get("/list", async (req, res) => {
  const data = await Service.find();

  res.json({
    status: true,
    data,
  });
});
router.put(
  "/update/:id",
  upload.fields([
    { name: "formatFiles", maxCount: 10 },
    { name: "govNotificationFiles", maxCount: 10 },
  ]),
  async (req, res) => {
    const service = await Service.findById(req.params.id);

    Object.assign(service, req.body);

    if (req.files["formatFiles"]) {
      service.formatFiles.push(
        ...req.files["formatFiles"].map(f => ({
          url: f.path,
          public_id: f.filename,
        }))
      );
    }

    if (req.files["govNotificationFiles"]) {
      service.govNotificationFiles.push(
        ...req.files["govNotificationFiles"].map(f => ({
          url: f.path,
          public_id: f.filename,
        }))
      );
    }

    await service.save();

    res.json({ status: true });
  }
);

router.delete("/delete-file/:id", async (req, res) => {
  const { public_id, type } = req.body;

  const service = await Service.findById(req.params.id);

  /// 🔥 CLOUDINARY DELETE
  await cloudinary.uploader.destroy(public_id);

  if (type === "format") {
    service.formatFiles = service.formatFiles.filter(
      f => f.public_id !== public_id
    );
  }

  if (type === "gov") {
    service.govNotificationFiles = service.govNotificationFiles.filter(
      f => f.public_id !== public_id
    );
  }

  await service.save();

  res.json({ status: true });
});

module.exports = router;