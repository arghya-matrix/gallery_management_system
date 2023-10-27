const multer = require("multer");
const db = require("../model/index");
const path = require("path");
const { Op } = require("sequelize");
const fs = require("fs");
const s3services = require("../services/s3.services");

// const imageStorage = multer.diskStorage({
//   destination: "./uploads",
//   filename: (req, file, cb) => {
//     return cb(
//       null,
//       `${req.userdata.user_name}_${file.fieldname}_${Date.now()}${path.extname(
//         file.originalname
//       )}`
//     );
//   },
// });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1000000000000 },
}).single("file");

async function uploadImage(req, res, next) {
  upload(req, res, async function (err) {
    if (err) {
      console.log(err, "<------Error Handling the file");
      return res.status(400).json({ error: "File upload failed" });
    }
    console.log(req.file.mimetype, " file data");
    if (
      (req.file.mimetype == "image/png" ||
        req.file.mimetype == "image/jpg" ||
        req.file.mimetype == "image/jpeg") &&
      req.userdata.type == "Admin"
    ) {
      try {
        const url = await s3services.putObject({
          file: req.file,
          name: req.body.image_name,
        });
        req.file.location = url;
        next();
      } catch (error) {
        console.log(error, "Error uploading in s3");
        res.status(500).json({
          message: `Error uploading file`,
          error: error,
        });
      }
    }
    if (!req.body.image_name) {
      res.status(403).json({
        message: `Image name is required to add image`,
      });
      return;
    } else if (req.userdata.type != "Admin") {
      res.status(401).json({
        message: `Only admin can save image`,
      });
      return;
    }
  });
}

async function updateImage(req, res, next) {
  const galleryData = await db.Gallery.findOne({
    where: {
      id: req.query.image_id,
    },
    raw: true,
  });

  if (galleryData) {
    const url = new URL(galleryData.image_url);
    const pathName = url.pathname;
    const inputString = pathName;
    const stringWithoutFirstSlash = inputString.substring(1);
    console.log(stringWithoutFirstSlash, "Filename");
    // const data = await s3services.deleteObject({
    //   fileName:stringWithoutFirstSlash
    // })
  }

  upload(req, res, async function (err) {
    if (err) {
      console.log(err, "<------Error Handling the file");
      return res.status(400).json({ error: "File upload failed" });
    }
    if (!req.file) {
      next();
    }
    if (
      req.file.mimetype != "image/png" ||
      req.file.mimetype != "image/jpg" ||
      req.file.mimetype != "image/jpeg"
    ) {
      res.status(403).json({
        message: `Image extension should be in .png or .jpg or .jpeg`,
      });
      return;
    } else {
      if (
        (req.file.mimetype == "image/png" ||
          req.file.mimetype == "image/jpg" ||
          req.file.mimetype == "image/jpeg") &&
        req.userdata.type == "Admin"
      ) {
        try {
          const url = await s3services.putObject({
            file: req.file,
            name: req.body.image_name,
          });
          req.file.location = url;
          next();
        } catch (error) {
          console.log(error, "Error uploading in s3");
          res.status(500).json({
            message: `Error uploading file`,
            error: error,
          });
        }
      }
    }
  });
}

module.exports = {
  uploadImage,
  updateImage,
};
