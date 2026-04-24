const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // cloudinary folder name
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
    public_id: (req, file) => {
      return Date.now() + "-" + file.originalname.split(".")[0];
    },
  },
});

const upload = multer({ storage });

module.exports = upload;
// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");

// const uploadPath = path.join(__dirname, "../uploads");

// /// 🔥 AUTO CREATE FOLDER
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadPath);
//   },
//   filename: function (req, file, cb) {
//     const uniqueName = Date.now() + "-" + file.originalname;
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({ storage });

// module.exports = upload;