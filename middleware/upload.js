const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {

    const originalName = file.originalname;
    const name = originalName.split('.').slice(0, -1).join('.');
    const ext = originalName.split('.').pop().toLowerCase();

    let resourceType = "auto";

    if (ext === "pdf" || ext === "doc" || ext === "docx") {
      resourceType = "raw";
    }

    return {
      folder: "uploads",

      /// 🔥 correct type
      resource_type: resourceType,

      /// 🔥 EXTENSION yaha add kar
      public_id: `${Date.now()}-${name}.${ext}`,
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("../config/cloudinary");

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: (req, file) => {

//     const ext = file.originalname.split('.').pop().toLowerCase();

//     /// 🔥 DETECT TYPE
//     let resourceType = "auto";

//     if (ext === "pdf" || ext === "doc" || ext === "docx") {
//       resourceType = "raw"; // 🔥 FORCE RAW
//     }

//     return {
//       folder: "uploads",

//       /// 🔥 CORRECT TYPE
//       resource_type: resourceType,

//       /// 🔥 KEEP EXTENSION
//       format: ext,

//       public_id: Date.now() + "-" + file.originalname.split('.')[0],
//     };
//   },
// });

// const upload = multer({ storage });

// module.exports = upload;
// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("../config/cloudinary");

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "uploads", // cloudinary folder name
//     resource_type: "auto",
//     allowed_formats: [
//   "jpg",
//   "png",
//   "jpeg",
//   "pdf",
//   "doc",
//   "docx",
//   "xls",
//   "xlsx",
//   "webp"
// ],
//     public_id: (req, file) => {
//       return Date.now() + "-" + file.originalname.split(".")[0];
//     },
//   },
// });

// const upload = multer({ storage });

// module.exports = upload;
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