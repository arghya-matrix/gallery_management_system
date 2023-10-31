const { Op } = require("sequelize");
const galleryServices = require("../services/gallery.services");
const db = require("../model/index");
const s3services = require("../services/s3.services");
const userServices = require("../services/user.services");

async function createGallery(req, res) {
  try {
    const createObject = {};
    createObject.image_name = req.body.image_name;
    createObject.image_url = req.file.location;
    createObject.image_type = req.file.mimetype;
    createObject.added_by = req.userdata.user_id;
    if (req.userdata.type == "Admin" || req.userdata.type == "Sub-Admin") {
      createObject.approved_stat = true;
    } else {
      createObject.approved_stat = false;
    }
    const gallery = await galleryServices.createGallery({
      createObject: createObject,
    });
    if(createObject.approved_stat == true){
      let createObjectForGallery;
      const user_id = await userServices.findAllUser();

      if (Array.isArray(user_id) == true) {
        createObjectForGallery = user_id.map((id) => ({
          image_id: gallery.id,
          user_id: id,
        }));
        await galleryServices.assignGalleryToUser({
          createObject: createObjectForGallery,
        });
      }
    }
    res.json({
      message: `Image added to gallery`,
      data: gallery,
    });
  } catch (error) {
    console.log(error, "<<---Internal error");
    res.status(500).json({
      message: `Server Error`,
      error: error,
    });
  }
}

async function updateGallery(req, res) {
  try {
    const updateOptions = {};
    const whereOptions = {};
    
    whereOptions.id = req.query.image_id;

    if (req.query.Name) {
      updateOptions.image_name = req.query.Name;
    }
    if (req.query.status) {
      if (req.query.status == "active") {
        updateOptions.active = true;
      }
      if (req.query.status == "inactive") {
        updateOptions.active == false;
      }
    }
    if (req.query.approved_stat == 'true') {
      updateOptions.approved_stat = true
      const user_id = await userServices.findAllUser();
      console.log(user_id,"User Id");

      let createObject;
      if (Array.isArray(user_id) == true) {
        createObject = user_id.map((id) => ({
          image_id: req.query.image_id,
          user_id: id,
        }));

        await galleryServices.assignGalleryToUser({
          createObject: createObject,
        });
      }
    } if(req.query.approved_stat == 'false'){
      updateOptions.approved_stat = false
    }
    if (req.file) {
      updateOptions.image_url = req.file.location;
    }
    const gallery = await galleryServices.updateGallery({
      updateOptions: updateOptions,
      whereOptions: whereOptions,
    });
    res.json({
      message: `Updated gallery`,
      data: gallery,
    });
  } catch (error) {
    console.log(error, "<<===Internal error");
    res.status(500).json({
      message: `Server error`,
      error: error,
    });
  }
}

async function getGalleryForAdmin(req, res) {
  try {
    const page = req.query.page ? req.query.page : 1;
    const itemsInPage = req.query.size;
    const size = itemsInPage ? +itemsInPage : 3;
    const index = page ? (page - 1) * size : 0;
    const whereObject = {};
    const orderOptions = [];

    if (req.query.colName && req.query.orderName) {
      orderOptions.push([req.query.colName, req.query.orderName]);
    } else {
      orderOptions.push(["createdAt", "DESC"]);
    }

    if (req.query.Name) {
      whereObject.image_name = { [Op.substring]: req.query.Name };
    }
    const gallery = await galleryServices.getGalleryForAdmin({
      whereOptions: whereObject,
      index: index,
      size: size,
    });
    const currentPage = page ? +page : 1;
    const totalPages = Math.ceil(gallery.count / size);
    res.json({
      message: `${gallery.count} galleries found`,
      currentPage: currentPage,
      totalPages: totalPages,
      gallery: gallery.rows,
    });
  } catch (error) {
    console.log(error, "internal error occured");
    res.status(500).json({
      message: "Server error",
      error: error,
    });
  }
}

async function getGalleryForUser(req, res) {
  const page = req.query.page ? req.query.page : 1;
  const itemsInPage = req.query.size;
  const size = itemsInPage ? +itemsInPage : 3;
  const index = page ? (page - 1) * size : 0;
  const whereObject = {};
  const orderOptions = [];

  if (req.query.colName && req.query.orderName) {
    orderOptions.push([req.query.colName, req.query.orderName]);
  } else {
    orderOptions.push(["createdAt", "DESC"]);
  }

  if (req.query.Name) {
    whereObject.image_name = { [Op.substring]: req.query.Name };
  }
  if (req.query.type) {
    whereObject.image_type = req.query.type;
  }
  whereObject.active = true;
  const gallery = await galleryServices.getGalleryForUser({
    whereOptions: whereObject,
    index: index,
    size: size,
    id: req.userdata.user_id,
    orderOptions: orderOptions,
  });
  const currentPage = page ? +page : 1;
  const totalPages = Math.round(gallery.count / size);
  res.json({
    message: `${gallery.count} galleries found`,
    currentPage: currentPage,
    totalPages: totalPages,
    gallery: gallery.rows,
  });
}

async function deleteGallery(req, res) {
  try {
    const whereOptions = {};
    whereOptions.id = req.query.image_id;

    const galleryData = await db.Gallery.findOne({
      where: {
        id: req.query.image_id,
      },
      raw: true,
    });

    if (galleryData) {
      const url = new URL(galleryData.image_url);
      const pathName = url.pathname;
      const inputString = pathName;
      const stringWithoutFirstSlash = inputString.substring(1);
      console.log(stringWithoutFirstSlash, "Filename");
      try {
        const data = await s3services.deleteObject({
          fileName: stringWithoutFirstSlash,
        });
        galleryServices.deleteGallery({
          whereOptions: whereOptions,
        });
      } catch (error) {
        console.log(error, "error deleting image");
        res.status(500).json({
          message: error,
        });
      }
    } else {
      res.status(404).json({
        message: `No data found`,
      });
      return;
    }
    res.json({
      message: `Gallery Deleted`,
    });
  } catch (error) {
    console.log(error, "Internal error");
    res.status(500).json({
      message: "Server error",
      error: error,
    });
  }
}

async function assignGalleryToUser(req, res) {
  try {
    let createObject;
    const user_id = req.user_array ? req.user_array : req.user_id;
    const image_id = req.image_array ? req.image_array : req.body.image_id;

    if (Array.isArray(image_id) == true) {
      createObject = image_id.map((id) => ({
        image_id: id,
        user_id: user_id,
      }));
    }

    if (Array.isArray(user_id) == true) {
      createObject = user_id.map((id) => ({
        image_id: req.body.image_id,
        user_id: id,
      }));
    }

    const gallery = await galleryServices.assignGalleryToUser({
      createObject: createObject,
    });
    res.status(200).json({
      message: `User assigned to the gallery`,
      assignedGallery: gallery,
    });
  } catch (error) {
    console.log(error, "<===Internal error");
    res.status(500).json({
      message: `Internal error`,
      error: error,
    });
  }
}

module.exports = {
  createGallery,
  updateGallery,
  getGalleryForAdmin,
  deleteGallery,
  getGalleryForUser,
  assignGalleryToUser,
};