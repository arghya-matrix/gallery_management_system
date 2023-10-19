const userServices = require("../services/user.services");
const sessionsServices = require("../services/sessionsServices");
const hashingServices = require("../services/hashing.services");
const generateNumber = require("../services/generateNumber");
const jwtServices = require("../services/jwt.services");
const mailer = require("../middleware/mailer");
const { Op, where } = require("sequelize");

async function signUp(req, res) {
  try {
    const stringWithSpaces = req.body.Name.toLowerCase();
    const userName = stringWithSpaces.replace(/\s/g, "");
    const number = generateNumber();
    const createObject = {};
    (createObject.Name = req.body.Name),
      (createObject.email_address = req.body.email_address);
    // createObject.user_type = req.body.user_type ? req.body.user_type : null

    createObject.assigned_to = req.body.assigned_to
      ? req.body.assigned_to
      : null;
    createObject.approved_stat = req.body.approved_stat
      ? req.body.approved_stat
      : null;
    createObject.approved_by = req.body.approved_by
      ? req.body.approved_by
      : null;
    createObject.user_name = userName.concat(number);
    createObject.password = req.password;

    const user = await userServices.createUser({
      createObject: createObject,
    });
    let messageUrl;
    if (user.user_type == "End-User") {
      messageUrl = await mailer.sendMailToAdmin({
        user: user,
        Admin: "Gallerywala",
      });
      console.log("message url", messageUrl);
      await mailer.sendMailToUserOnSignUp({
        Admin: "Gallerywala",
        user: user,
      });
    }
    res.status(200).json({
      message: `${req.body.email_address} created`,
      data: user,
      url: messageUrl,
    });
  } catch (error) {
    console.log(error, "<--- Error creating user");
    res.status(500).json({
      message: `Internal error`,
    });
  }
}

async function signIn(req, res) {
  try {
    const data = req.body;
    const whereOptions = {};
    whereOptions.email_address = data.email_address;
    const user = await userServices.findUser({
      whereOptions: whereOptions,
    });
    const dbUser = user.rows[0];
    // console.log(dbUser);
    // console.log(data);

    if (user.count == 0) {
      res.json({
        message: `!!!!You are not Signed Up!!!!`,
      });
    } else if (data.email_address == dbUser.email_address) {
      const result = await hashingServices.checkPassword({
        hash: dbUser.password,
        password: data.password,
      });

      if (result == true) {
        const findSession = await sessionsServices.findSessionByUserId({
          user_id: dbUser.id,
        });

        if (findSession.count <= 0) {
          const sessions = await sessionsServices.createSession({
            user_id: dbUser.id,
          });
          const jwt = jwtServices.createToken({
            sessions_id: sessions.id,
            user_id: dbUser.id,
            user_name: dbUser.user_name,
            type: dbUser.user_type,
          });
          const authData = jwtServices.verifyToken(jwt);

          // console.log(authData, "<---- Auth data");
          const expDate = new Date(authData.exp * 1000);
          const iatDate = new Date(authData.iat * 1000);

          await sessionsServices.updateSession({
            expiry_date: expDate,
            login_date: iatDate,
            sessions_id: authData.sessions_id,
          });

          const userdata = user.rows[0];
          delete userdata.password;
          // delete userdata.user_id;
          // console.log(userdata,"Profile details in User controller");

          res.json({
            message: "Logged In",
            Profile: userdata,
            JWTtoken: jwt,
          });
        } else {
          const currentDate = new Date();
          // console.log(findSession.rows,"<<-Session data");
          const data = findSession.rows[0];
          await sessionsServices.updateExistingSession({
            expiry_date: currentDate,
            logout_date: currentDate,
            sessions_id: data.id,
          });

          const sessions = await sessionsServices.createSession({
            user_id: dbUser.id,
          });
          const jwt = jwtServices.createToken({
            sessions_id: sessions.id,
            user_id: dbUser.id,
            user_name: dbUser.user_name,
            type: dbUser.user_type,
          });
          const authData = jwtServices.verifyToken(jwt);
          const expDate = new Date(authData.exp * 1000);
          const iatDate = new Date(authData.iat * 1000);

          await sessionsServices.updateSession({
            expiry_date: expDate,
            login_date: iatDate,
            sessions_id: authData.sessions_id,
          });

          const userdata = user.rows[0];
          delete userdata.password;

          res.json({
            message: "Logged In",
            Profile: userdata,
            JWTtoken: jwt,
          });
        }
      } else if (result == false) {
        return res.status(401).json({
          message: `Wrong password`,
        });
      }
    } else {
      res.json({
        message: "Invalid Email Address",
      });
    }
  } catch (error) {
    console.log(error, "<-----Error???>>>>>");
    res.status(500).json({
      message: `Server Error`,
      err: error,
    });
  }
}

async function updateUser(req, res) {
  const data = req.query;
  const updateOptions = {};
  const whereOptions = {};
  whereOptions.id = req.userdata.user_type;

  if (data.Name) {
    updateOptions.Name = data.Name;
  }
  if (data.email_address) {
    updateOptions.email_address = data.email_address;
  }
  const user = await userServices.updateUser({
    updateOptions: updateOptions,
    whereOptions: whereOptions,
  });
  if (user.statuscode == 200) {
    res.status(200).json({
      message: user.message,
      data: user.data,
    });
  }
  if (user.statuscode == 500) {
    res.status(500).json({
      message: user.message,
      error: user.error,
    });
  }
}

async function getUser(req, res) {
  try {
    if (req.userdata.type == "Sub-Admin") {
      const whereOptions = {};
      const attributes = ["Name", "user_name", "email_address"];
      const page = req.query.page ? req.query.page : 1;
      const itemsInPage = req.query.size;
      const size = itemsInPage ? +itemsInPage : 3;
      const index = page ? (page - 1) * size : 0;

      whereOptions.assigned_to = req.userdata.user_id;
      if (req.query.Name) {
        whereOptions.Name = { [Op.substring]: req.query.Name };
      }
      if (req.query.approved_stat) {
        if (req.query.approved_stat == "Approved") {
          whereOptions.approved_stat == true;
        }
        if (req.query.approved_stat == "Rejected") {
          whereOptions.approved_stat == false;
        }
      }

      const users = await userServices.findUser({
        whereOptions: whereOptions,
        index: index,
        size: size,
        attributes: attributes,
      });
      const currentPage = page ? +page : 1;
      const totalPages = Math.round(users.count / size);
      res.status(200).json({
        message: `${users.count} User found`,
        currentPage: currentPage,
        totalPages: totalPages,
        user: users.rows,
      });
    } else {
      const whereOptions = {};
      const page = req.query.page ? req.query.page : 1;
      const itemsInPage = req.query.size;
      const size = itemsInPage ? +itemsInPage : 3;
      const index = page ? (page - 1) * size : 0;
      const attributes = ["Name", "user_name", "email_address"];

      if (req.query.Name) {
        whereOptions.Name = { [Op.substring]: req.query.Name };
      }
      if (req.query.approved_stat) {
        if (req.query.approved_stat == "Approved") {
          whereOptions.approved_stat == true;
        }
        if (req.query.approved_stat == "Rejected") {
          whereOptions.approved_stat == false;
        }
      }

      const users = await userServices.findUser({
        whereOptions: whereOptions,
        index: index,
        size: size,
        attributes: attributes
      });
      const currentPage = page ? +page : 1;
      const totalPages = Math.round(users.count / size);
      res.status(200).json({
        message: `${users.count} User found`,
        currentPage: currentPage,
        totalPages: totalPages,
        user: users.rows,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: `internal error occured`,
      error: error,
    });
  }
}

async function addSubAdmin(req, res) {
  try {
    if (req.userdata.type === "Admin") {
      const stringWithSpaces = req.body.Name.toLowerCase();
      const userName = stringWithSpaces.replace(/\s/g, "");
      const number = generateNumber();
      const createObject = {};

      createObject.Name = req.body.Name;
      createObject.email_address = req.body.email_address;
      createObject.user_type = req.body.user_type
        ? req.body.user_type
        : "Sub-Admin";

      createObject.assigned_to = req.body.assigned_to
        ? req.body.assigned_to
        : 1;
      createObject.approved_stat = req.body.approved_stat
        ? req.body.approved_stat
        : true;
      createObject.approved_by = req.body.approved_by
        ? req.body.approved_by
        : 1;
      createObject.user_name = userName.concat(number);
      createObject.password = req.password;

      const user = await userServices.createUser({
        createObject: createObject,
      });
      delete user.password;
      delete user.id;
      delete user.assigned_to;
      delete user.approved_stat;

      res.status(200).json({
        message: `${req.body.email_address} created`,
        data: user,
      });
    }
  } catch (error) {}
}

async function changeApproveStatOfUser(req, res) {
  const updateOptions = {};
  const whereOptions = {};
  if (req.userdata.type == "Admin") {
    console.log("UserData", req.userdata);
    updateOptions.approved_stat = req.query.approved_stat;
    updateOptions.approved_by = req.userdata.user_id;
    whereOptions.id = req.query.id;
    const user = await userServices.updateUser({
      updateOptions: updateOptions,
      whereOptions: whereOptions,
    });
    const data = await userServices.findUser({
      whereOptions: whereOptions,
    });
    const userData = data.rows[0];

    if (user.statuscode == 200) {
      const stat =
        req.query.approved_stat === "true"
          ? "Accepted"
          : req.query.approved_stat === "false"
          ? "Rejected"
          : "Not Approved Yet";
      const mail = await mailer.sendMailToUser({
        Admin: "Gallerywala",
        body: userData,
        stat: stat,
      });
      res.status(200).json({
        message: `${user.data.Name} is updated`,
        data: user.data,
      });
    }
    if (user.statuscode == 500) {
      res.status(500).json({
        message: user.message,
        error: user.error,
      });
    }
  }
  if (req.userdata.type == "Sub-Admin") {
    whereOptions.id = req.query.id;
    whereOptions.assigned_to = req.userdata.user_id;
    const user = await userServices.findUser({
      whereOptions: whereOptions,
    });
    if (user.count == 0) {
      res.json({
        message: `No such user or User is not assigned to you`,
      });
    } else {
      updateOptions.approved_stat = req.query.approved_stat;
      updateOptions.approved_by = req.userdata.user_id;

      const updateUser = await userServices.updateUser({
        updateOptions: updateOptions,
        whereOptions: whereOptions,
      });
      const data = await userServices.findUser({
        whereOptions: whereOptions,
      });
      const userData = data.rows[0];
      whereOptions.id = req.userdata.user_id;
      if (updateUser.statuscode == 200) {
        const stat =
          req.query.approved_stat === "true"
            ? "Accepted"
            : req.query.approved_stat === "false"
            ? "Rejected"
            : "Not Approved Yet";

        const mail = await mailer.sendMailToUser({
          Admin: "Gallerywala",
          body: userData,
          stat: stat,
        });
        res.status(200).json({
          message: `${updateUser.data.Name} is updated`,
          data: user.data,
        });
      }
      if (updateUser.statuscode == 500) {
        res.status(500).json({
          message: updateUser.message,
          error: updateUser.error,
        });
      }
    }
  }
}

async function assignSubAdmin(req, res) {
  try {
    const updateOptions = {};
    const whereOptions = {};
    if (!req.query.sub_admin) {
      return res.json({
        message: `Enter sub admin id to proceed`,
      });
    }
    if (!req.query.user_id) {
      return res.json({
        message: `Enter user id to proceed`,
      });
    }
    if (req.userdata.type == "Admin") {
      updateOptions.assigned_to = req.query.sub_admin;
      whereOptions.id = req.query.user_id;
      const user = await userServices.updateUser({
        updateOptions: updateOptions,
        whereOptions: whereOptions,
      });
      whereOptions.id = req.query.sub_admin;
      const subAdmin = await userServices.findUser({
        whereOptions: whereOptions,
      });
      const messageUrl = await mailer.sendMailToSubAdmin({
        Admin: "Gallerywala",
        subAdmin: subAdmin.rows[0],
        user: user.data,
      });
      res.json({
        message: `${user.data.Name} is assigned to ${subAdmin.rows[0].Name}`,
        mailUrl: messageUrl,
      });
    }
  } catch (error) {
    console.log(error, "<<<---- An internal error occured");
    res.status(500).json({
      message: `internal error`,
      error: error,
    });
  }
}

async function getUsersAssignedToSubAdmin(req, res) {
  try {
  } catch (error) {
    console.log(error, "<--- Internal Error");
    res.status(500).json({
      message: `Server error`,
      error: error,
    });
  }
}

module.exports = {
  signUp,
  signIn,
  updateUser,
  getUser,
  addSubAdmin,
  changeApproveStatOfUser,
  assignSubAdmin,
  getUsersAssignedToSubAdmin,
};
