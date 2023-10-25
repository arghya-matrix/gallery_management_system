const multer = require("multer");
const db = require("../model/index");
const path = require("path");
const { Op } = require("sequelize");
const fs = require("fs");

const imageStorage = multer.diskStorage({
  destination: "./uploads",
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
}).single("gallery");

async function uploadImage(req, res, next) {
  upload(req, res, async function (err) {
    if (err) {
      // console.log(req.body, "<-----Body Data");
      console.log(err, "<------Error Handling the file");
      return res.status(400).json({ error: "File upload failed" });
    }
    if (req.userdata.type == "Admin") {
      req.url = `http://localhost:8080/uploads/${req.file.filename}`;
      next();
    }
    if (!req.body.image_name) {
      fs.unlinkSync(req.file.path);
      return;
    } else if (req.userdata.type != "Admin") {
      fs.unlinkSync(req.file.path);
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
    console.log(req.body,"<-- body data");
    if (!req.body.gallery) {
      console.log("Inside update image");
      fs.unlinkSync(req.file.path);
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
