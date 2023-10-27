const { Op, where } = require("sequelize");
const userServices = require("../services/user.services");
const db = require('../model/index')
const validateUser = async function (req, res, next) {
  const data = req.body;
  const regex = /^[A-Za-z]+(?: [A-Za-z]+)? [A-Za-z]+$/;

  if (data.Name) {
    if (data.Name == " " || data.Name == null || data.Name == undefined) {
      res.status(422).json({
        message: "Invalid Name",
      });
      return;
    }
    if (!regex.test(data.Name)) {
      res.status(400).json({
        message: `Invalid Name`,
      });
      return;
    }
  }
  next();
};

const validateEmail = async function (req, res, next) {
  const email = req.body.email_address;
  const regex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}/;
  if (!regex.test(email)) {
    res.status(400).json({
      message: "Invalid email format",
    });
    return;
  }
  next();
};

async function checkExistingUser(req, res, next) {
  const whereOptions = {};
  whereOptions.email_address = req.body.email_address;
  const user = await userServices.findUser({
    whereOptions: whereOptions,
  });
  if (user.count > 0) {
    res.status(409).json({
      message: "user already signed up",
    });
    return;
  }
  next();
}

async function validatePassword(req, res, next) {
  const regex = /^[^\s]*$/;
  const password = req.body.password;

  if (!regex.test(password)) {
    let errorMessage = "Password must meet the following criteria:\n";
    errorMessage += "1. Start with an uppercase letter.\n";
    errorMessage += "2. Contain at least three digits.\n";
    errorMessage += "3. Include at least one special character.\n";
    errorMessage += "4. Be at least 7 characters long.";

    res.status(400).json({
      message: errorMessage,
    });
    return;
  } else {
    next();
  }
}

async function userApprovedOrNot(req, res, next) {
  const whereOptions = {};
  whereOptions.email_address = req.body.email_address;

  const user = await userServices.findUser({
    whereOptions: whereOptions,
  });
  const data = user.rows[0];

  if (user.count == 0) {
    res.json({
      message: `Sign up to log in`,
    });
  }

  if (data.user_type == "Admin" || data.user_type == "Sub-Admin") {
    next();
  } else {
    whereOptions.approved_stat = true;
    const userData = await userServices.findUser({
      whereOptions: whereOptions,
    });
    if (userData.count > 0) {
      next();
    } else {
      res.json({
        message: `Wait till admin approves your request`,
      });
      return;
    }
  }
}

async function userSubAdminOrNot(req, res, next) {
  if (req.query.user_id) {
    if (req.userdata.type == "Admin") {
      const user = await db.User.findOne({
        where: {
          id: req.query.user_id,
        },
        raw: true,
      });
      if (user.user_type == "Sub-Admin") {
        res.status(409).json({
          message: `Sub-Admin cannot be assigned to Sub-Admin`,
        });
        return;
      } else {
        next();
      }
      next();
    } else {
      const whereOptions = {};
      whereOptions.id = req.query.user_id;
      const user = await userServices.findUser({
        whereOptions: whereOptions,
      });
      const userData = user.rows[0].toJSON();

      if (userData.assigned_to == req.userdata.user_id) {
        next();
      } else {
        return res.status(422).json({
          message: `User is not assigned to you`,
        });
      }
    }
  } else {
    return res.status(403).json({
      message: `Enter user id to change the approval status`,
    });
  }
}

module.exports = {
  validateUser,
  validateEmail,
  checkExistingUser,
  validatePassword,
  userApprovedOrNot,
  userSubAdminOrNot
};
