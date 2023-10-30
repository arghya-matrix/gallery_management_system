const { Op } = require("sequelize");
const db = require("../model/index");

async function createGallery({ createObject }) {
  const gallery = await db.Gallery.create(createObject, {
    raw: true,
  });
  return gallery;
}

async function updateGallery({ updateOptions, whereOptions }) {
  await db.Gallery.update(updateOptions, {
    where: whereOptions,
  });
  const gallery = await db.Gallery.findOne({
    where: whereOptions,
    raw: true,
  });
  return gallery;
}

async function getGalleryForAdmin({ whereOptions, index, size, orderOptions }) {
  const gallery = await db.Gallery.findAndCountAll({
    include: [
      {
        model: db.AssignedGallery,
        attributes: ['id'],
        include: {
          model: db.User,
          attributes: ['id',"Name"],
        },
      },
    ],
    where: whereOptions,
    order: orderOptions,
    limit: size,
    offset: index,
  });
  return gallery;
}

async function deleteGallery({ whereOptions }) {
  await db.Gallery.destroy({
    where: whereOptions,
  });
}

async function getGalleryForUser({
  whereOptions,
  id,
  size,
  index,
  orderOptions,
}) {
  const gallery = await db.Gallery.findAndCountAll({
    include: {
      model: db.AssignedGallery,
      attributes: [],
      where: {
        user_id: id,
      },
    },
    where: whereOptions,
    order: orderOptions,
    limit: size,
    offset: index,
  });
  return gallery;
}

async function assignGalleryToUser({ createObject }) {
  const assignedUser = await db.AssignedGallery.bulkCreate(createObject, {
    raw: true,
  });
  return assignedUser;
}

async function findGallery({ whereOptions }) {
  const gallery = await db.AssignedGallery.findAndCountAll({
    where: whereOptions,
    raw: true,
  });
  return gallery;
}

async function findImageId() {
  const images = await db.Gallery.findAll({
    attributes: ["id"],
    where: {
      approved_stat: { [Op.or]: [null, true] },
    },
    raw: true,
  });
  const idArray = images.map((image) => parseInt(image.id));
  return idArray;
}

module.exports = {
  createGallery,
  updateGallery,
  getGalleryForAdmin,
  deleteGallery,
  getGalleryForUser,
  assignGalleryToUser,
  findGallery,
  findImageId,
};
