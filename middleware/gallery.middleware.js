  const userServices = require("../services/user.services");
const galleryServices = require("../services/gallery.services");
const uploadImage = require("./uploadImage");

function removeIntegerFromArray(arr, integerToRemove) {
  const indexToRemove = arr.indexOf(integerToRemove);

  if (indexToRemove !== -1) {
    arr.splice(indexToRemove, 1);
  }
  return arr;
}

async function checkUserType(req, res, next) {
  if (req.userdata.type == "Admin" || req.userdata.type == "Sub-Admin") {
    next();
  } else {
    res.status(403).json({
      message: `Only admin or sub admin can access this`,
    });
    return;
  }
}

async function galleryValidation(req, res, next) {
  console.log(req.file);
  if (!req.body.image_name) {
    res.status(400).json({
      message: `image name is required to add image`,
    });
    return;
  }
  if (req.userdata.type != "Admin") {
    res.status(403).json({
      message: `Only admin can add file`,
    });
    return;
  }
  next();
}

async function checkStatOfUser(req, res, next) {
  if (
    Array.isArray(req.body.image_id) == true &&
    Array.isArray(req.body.user_id) == true
  ) {
    res.status(404).json({
      message: "image_id and user_id both cannot be array",
    });
    return;
  }
  if (
    Array.isArray(req.body.image_id) == false &&
    Array.isArray(req.body.user_id) == false
  ) {
    req.user_id = req.body.user_id;
    next();
  }

  if (
    Array.isArray(req.body.user_id) == true &&
    Array.isArray(req.body.image_id) == false
  ) {
    const whereOptions = {};
    whereOptions.id = req.body.user_id;
    whereOptions.approved_stat = true;
    const user_id = await userServices.findOneUser({
      whereOptions: whereOptions,
    });
    if (user_id.length > 0) {
      req.user_id = user_id;
      next();
    } else {
      res.json({
        message: `no such user found with the credentials`,
      });
    }
  }
  if (
    Array.isArray(req.body.image_id) == true &&
    Array.isArray(req.body.user_id) == false
  ) {
    req.user_id = req.body.user_id;
    next();
  }
}

async function duplicateAssigning(req, res, next) {
  if (Array.isArray(req.user_id) == true) {
    const whereOptions = {};
    whereOptions.user_id = req.user_id;
    whereOptions.image_id = req.body.image_id;
    const gallery = await galleryServices.findGallery({
      whereOptions: whereOptions,
    });
    let arr;
    if (gallery.count > 0) {
      gallery.rows.map((obj) => {
        arr = removeIntegerFromArray(req.user_id, obj.user_id);
      });
      if (arr.length > 0) {
        req.user_array = arr;
        next();
      } else {
        res.status(409).json({
          message: "Users already assigned to gallery",
        });
        return;
      }
    } else {
      next();
    }
  }
  if (Array.isArray(req.body.image_id) == true) {
    const whereOptions = {};
    whereOptions.user_id = req.user_id;
    whereOptions.image_id = req.body.image_id;
    const gallery = await galleryServices.findGallery({
      whereOptions: whereOptions,
    });

    let arr;
    if (gallery.count > 0) {
      gallery.rows.map((obj) => {
        arr = removeIntegerFromArray(req.body.image_id, obj.image_id);
      });
      if (arr.length > 0) {
        req.image_array = arr;
        next();
      } else {
        res.status(409).json({
          message: "Images are already assigned to all users in gallery",
        });
        return;
      }
    } else {
      next();
    }
  }
}

module.exports = {
  checkUserType,
  galleryValidation,
  checkStatOfUser,
  duplicateAssigning,
};
