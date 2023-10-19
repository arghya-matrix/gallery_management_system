const { Sequelize } = require("sequelize");
const sequelize = new Sequelize({
    host : "localhost",
    dialect: "mysql",
    database : "gallerywala",
    port : 3306,
    username: "root",
    password : "Matrix@2023",
    logging : false
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log("Error database: -> ", err);
  });

  module.exports = sequelize