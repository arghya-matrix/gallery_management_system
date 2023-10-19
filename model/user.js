const { DataTypes } = require("sequelize");
const sequelize = require("../db/config");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  user_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email_address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
  },
  user_type: {
    type: DataTypes.STRING,
    defaultValue: "End-User",
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  approved_stat: {
    type: DataTypes.BOOLEAN,
  },
  approved_by: {
    type: DataTypes.INTEGER,
  },
});

module.exports = User;
