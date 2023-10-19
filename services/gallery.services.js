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

async function getGallery({ whereOptions }) {
  const gallery = await db.Gallery.findAndCountAll({
    include: [
      {
        model: db.AssignedGallery,
        attributes: [""],
        include: {
          model: db.User,
          attributes: ["Name"],
        },
      },
    ],
    where: whereOptions,
  });
  return gallery;
}

async function deleteGallery({ whereOptions }) {
  await db.Gallery.destroy({
    where: whereOptions,
  });
}

module.exports = {
  createGallery,
  updateGallery,
  getGallery,
  deleteGallery,
};
