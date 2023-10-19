const sequlize = require("../db/config");
const User = require("./user");
const Sessions = require("./sessions");
const Gallery = require("../model/gallerytable");
const AssignedGallery = require("./assigned_gallery");

User.hasMany(AssignedGallery, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
AssignedGallery.belongsTo(User, {
  foreignKey: "user_id",
});

Gallery.hasMany(AssignedGallery, {
  foreignKey: "image_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
AssignedGallery.belongsTo(Gallery,{
    foreignKey:"image_id"
})

sequlize.sync({ alter: true });

module.exports = {
  sequlize,
  User,
  Sessions,
  Gallery,
  AssignedGallery,
};