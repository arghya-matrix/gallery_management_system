const { DataTypes } = require("sequelize");
const sequelize = require("../db/config");
const assgned_gallery = sequelize.define("AssignedGallery", {
  image_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
  },
  status:{
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = assgned_gallery