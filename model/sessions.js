const { DataTypes } = require("sequelize");
const sequelize = require("../db/config");

const Sessions = sequelize.define("Session", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  login_date: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  logout_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = Sessions;