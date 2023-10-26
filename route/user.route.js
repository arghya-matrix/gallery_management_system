const userController = require("../controller/user.controller");
const userValidation = require("../middleware/validateUser");
const tokenVerify = require("../middleware/tokenverify");
const passwordHashing = require("../middleware/hashing");
const express = require("express");
const router = express.Router();

router.post(
  "/sign-up",
  [
    userValidation.validateEmail,
    userValidation.validatePassword,
    userValidation.validateUser,
    userValidation.checkExistingUser,
    passwordHashing.hashPassword,
  ],
  userController.signUp
);

router.post(
  "/sign-in",
  [
    userValidation.validateEmail,
    userValidation.validatePassword,
    userValidation.validateUser,
    userValidation.userApprovedOrNot,
  ],
  userController.signIn
);

router.post("/sign-out",tokenVerify.userProfile, userController.logOut);

router.put("/update", tokenVerify.userProfile, userController.updateUser);

router.get("/get-user", tokenVerify.userProfile, userController.getUser);

router.post(
  "/add-sub-admin",
  tokenVerify.userProfile,
  passwordHashing.hashPassword,
  userController.addSubAdmin
);
router.put(
  "/approve-status",
  tokenVerify.userProfile,
  userController.changeApproveStatOfUser
);

router.put("/assign-sub-admin", tokenVerify.userProfile, userController.assignSubAdmin);
router.get("/get-users", tokenVerify.userProfile, userController.getUsersAssignedToSubAdmin);

module.exports = router;
