const { DataTypes } = require("sequelize");
const sequelize = require("../db/config");
const gallery = sequelize.define("Gallery", {
  image_name:{
    type: DataTypes.STRING,
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = gallery;