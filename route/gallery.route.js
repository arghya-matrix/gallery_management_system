const tokenVerify = require("../middleware/tokenverify");
const passwordHashing = require("../middleware/hashing");
const express = require("express");
const router = express.Router();
const galleryMiddleware = require("../middleware/gallery.middleware");
const galleryController = require("../controller/gallery.controller");
const uploadImage = require("../middleware/uploadImage");

router.post(
  "/assign-users",
  tokenVerify.userProfile,
  galleryMiddleware.checkUserType,
  galleryMiddleware.checkStatOfUser,
  galleryMiddleware.duplicateAssigning,
  galleryController.assignGalleryToUser
);

router.post(
  "/create-gallery",
  tokenVerify.userProfile,
  galleryMiddleware.checkUserType,
  uploadImage.uploadImage,
  galleryController.createGallery
);

router.get(
  "/get-gallery-for-admin",
  tokenVerify.userProfile,
  galleryMiddleware.checkUserType,
  galleryController.getGalleryForAdmin
);

router.get(
  "/get-gallery-for-user",
  tokenVerify.userProfile,
  galleryController.getGalleryForUser
);

router.put(
  "/update-gallery",
  [
    tokenVerify.userProfile,
    galleryMiddleware.checkUserType,
    uploadImage.updateImage,
  ],
  galleryController.updateGallery
);

router.delete(
  "/delete-gallery",
  [tokenVerify.userProfile, galleryMiddleware.checkUserType],
  galleryController.deleteGallery
);

module.exports = router;
