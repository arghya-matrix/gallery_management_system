const galleryServices = require("../services/gallery.services");

async function createGallery(req, res) {
  try {
    const createObject = {};
    createObject.image_name = req.body.Name;
    createObject.image_url = req.url;
    createObject.type = "image";
    const gallery = await galleryServices.createGallery({
      createObject: createObject,
    });
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

async function updateGallery(req,res){
    try {
        const updateOptions = {};
        if(req.query.Name){
            updateOptions.image_name = req.query.Name
        }
        if(req.url){
            updateOptions.image_url = req.url
        }
        const gallery = await galleryServices.updateGallery({
            updateOptions: updateOptions
        })
        res.json({
            message:`Updated gallery`,
            data: gallery
        })
    } catch (error) {
        console.log(error,"<<===Internal error");
        res.status(500).json({
            message:`Server error`,
            error:error
        })
    }
}

module.exports = {
  createGallery,
  updateGallery
};
