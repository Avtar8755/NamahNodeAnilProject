const multer = require("multer");

const {
  CloudinaryStorage,
} = require("multer-storage-cloudinary");

const cloudinary =
    require("../config/cloudinary");

const storage = new CloudinaryStorage({

  cloudinary,

  params: async (req, file) => {

    const ext =
        file.originalname
            .split(".")
            .pop()
            .toLowerCase();

    /// 🔥 DEFAULT
    let resourceType = "auto";

    /// 🔥 PDF AS IMAGE
    if (ext === "pdf") {

      resourceType = "image";
    }

    /// 🔥 DOC/DOCX AS RAW
    if (
        ext === "doc" ||
        ext === "docx"
    ) {

      resourceType = "raw";
    }

    return {

      folder: "uploads",

      resource_type:
      resourceType,

      format: ext,

      public_id:
      Date.now() +
      "-" +
      file.originalname
          .split(".")[0],
    };
  },
});

const upload = multer({
  storage,
});

module.exports = upload;
// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("../config/cloudinary");

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: (req, file) => {

//     const originalName = file.originalname;
//     const name = originalName.split('.').slice(0, -1).join('.');
//     const ext = originalName.split('.').pop().toLowerCase();

//     let resourceType = "auto";

//     if (ext === "pdf" || ext === "doc" || ext === "docx") {
//       resourceType = "raw";
//     }

//     return {
//       folder: "uploads",

//       /// 🔥 correct type
//       resource_type: resourceType,

//       /// 🔥 EXTENSION yaha add kar
//       public_id: `${Date.now()}-${name}.${ext}`,
//     };
//   },
// });

// const upload = multer({ storage });

// module.exports = upload;
