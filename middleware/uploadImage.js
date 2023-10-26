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
    console.log(req.file.mimetype," file data");
    if (
      (req.file.mimetype == "image/png" ||
        req.file.mimetype == "image/jpg" ||
        req.file.mimetype == "image/jpeg") &&
      req.userdata.type == "Admin"
    ) {
      const url = await s3services.putObject({
        file: req.file,
        name: req.body.image_name,
      });
      req.url = url;
      next();
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
    const directory = path.join(__dirname, "..", pathName);

    if (fs.existsSync(directory)) {
      fs.unlink(directory, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
  }

  upload(req, res, async function (err) {
    if (err) {
      console.log(err, "<------Error Handling the file");
      return res.status(400).json({ error: "File upload failed" });
    }
    if (!req.file) {
      fs.unlinkSync(req.file.path);
      next();
    }
    if (
      req.file.mimetype != "image/png" ||
      req.file.mimetype != "image/jpg" ||
      req.file.mimetype != "image/jpeg"
    ) {
      fs.unlinkSync(req.file.path);
      res.status(403).json({
        message: `Image extension should be in .png or .jpg or .jpeg`,
      });
      return;
    } else {
      if (req.userdata.type == "Admin") {
        req.url = `http://localhost:8080/uploads/${req.file.filename}`;
        console.log(req.url, "<<==URL");
        next();
      } else if (req.userdata.type != "Admin") {
        fs.unlinkSync(req.file.path);
        return;
      }
    }
  });
}

module.exports = {
  uploadImage,
  updateImage,
};
