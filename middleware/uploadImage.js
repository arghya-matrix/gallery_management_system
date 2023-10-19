const multer = require("multer");
const db = require("../models/index");
const path = require("path");
const { Op } = require("sequelize");
const fs = require("fs");

const imageStorage = multer.diskStorage({
  destination: "./upload",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${req.userdata.user_name}_${file.fieldname}_${Date.now()}${path.extname(
        file.originalname
      )}`
    );
  },
});

const upload = multer({
  storage: imageStorage,
  limits: { fileSize: 1000000000000 },
}).single("Eventimages");

async function uploadImage(req, res, next) {
  upload(req, res, async function (err) {
    if (err) {
      // console.log(req.body, "<-----Body Data");
      console.log(err, "<------Error Handling the file");
      return res.status(400).json({ error: "File upload failed" });
    }
    if (req.userdata.type == "Admin") {
      req.url = `http://localhost:3300/upload/${req.file.filename}`;
      next();
    }
    if (!req.body.image_name) {
      fs.unlinkSync(req.file.path);
      return res.json({
        message: `image name is required to add image`,
      });
    } else {
      fs.unlinkSync(req.file.path);
      return res.json({
        message: `Only admin can add file`,
      });
    }
  });
}
module.exports = {
  uploadImage,
};
