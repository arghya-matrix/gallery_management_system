const { Op } = require("sequelize");
const db = require("../model/index");

async function findUser({ whereOptions, index, size, attributes }) {
  const user = await db.User.findAndCountAll({
    attributes: attributes,
    where: whereOptions,
    limit: size,
    offset: index,
    raw: true,
  });
  return user;
}

async function createUser({ createObject }) {
  const user = await db.User.create(createObject, {
    raw: true,
  });
  return user;
}

async function deleteUser({ whereOptions }) {
  try {
    await db.User.destroy({
      where: whereOptions,
    });
    return {
      error: false,
      statuscode: 200,
    };
  } catch (error) {
    console.log(error, "Error deleting user... in services", error);
    return {
      error: true,
      statuscode: 403,
      message: "",
    };
  }
}

async function updateUser({ whereOptions, updateOptions }) {
  try {
    const [numUpdatedRows] = await db.User.update(updateOptions, {
      where: whereOptions,
    });
    if (numUpdatedRows > 0) {
      const user = await db.User.findOne({
        where: whereOptions,
      });
      return {
        error: false,
        statuscode: 200,
        message: "User updated",
        data: user,
      };
    }
  } catch (error) {
    console.log(error, "Error updating user... in services", error);
    return {
      error: true,
      statuscode: 500,
      message: "Internal server error",
    };
  }
}

async function findOneUser({ whereOptions }) {
  const user = await db.User.findAll({
    attributes: ["id"],
    where: whereOptions,
    raw: true,
  });
  const idArray = user.map((user) => parseInt(user.id));
  return idArray;
}

async function findAllUser() {
  const users = await db.User.findAll({
    attributes: ["id"],
    where: {
      [Op.and]: {
        approved_stat: true,
        user_type: "End-User",
      },
    },
    raw: true,
  });
  const idArray = users.map((user) => parseInt(user.id));
  return idArray;
}

module.exports = {
  findUser,
  createUser,
  deleteUser,
  updateUser,
  findOneUser,
  findAllUser,
};
