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
  added_by:{
    type:DataTypes.INTEGER
  },
  approved_stat:{
    type: DataTypes.BOOLEAN,
  }
});

module.exports = gallery;