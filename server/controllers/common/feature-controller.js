const Feature = require("../../models/Feature");
const fs = require("fs");
const path = require("path");

const addFeatureImage = async (req, res) => {
  try {
    const { image } = req.body;

    console.log(image, "image");

    // Validate that image URL is not empty
    if (!image || image.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    // If it's a local path, verify the file exists
    if (!image.startsWith("http")) {
      const filename = path.basename(image);
      const uploadsDir = path.join(__dirname, "../../uploads");
      const filePath = path.join(uploadsDir, filename);

      if (!fs.existsSync(filePath)) {
        return res.status(400).json({
          success: false,
          message: "Image file does not exist on server",
        });
      }
    }

    const featureImages = new Feature({
      image,
    });

    await featureImages.save();

    res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({});

    // Filter out invalid images
    const validImages = images.filter((img) => {
      // Check if image field exists and is not empty
      if (!img.image || img.image.trim() === "") {
        return false;
      }

      // If it's a local path, check if file exists
      if (!img.image.startsWith("http")) {
        const filename = path.basename(img.image);
        const uploadsDir = path.join(__dirname, "../../uploads");
        const filePath = path.join(uploadsDir, filename);
        return fs.existsSync(filePath);
      }

      // If it's an external URL, include it
      return true;
    });

    res.status(200).json({
      success: true,
      data: validImages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// Add delete function
const deleteFeatureImage = async (req, res) => {
  try {
    const { id } = req.params;

    const featureImage = await Feature.findById(id);

    if (!featureImage) {
      return res.status(404).json({
        success: false,
        message: "Feature image not found",
      });
    }

    // If it's a local file, delete it from uploads folder
    if (featureImage.image && !featureImage.image.startsWith("http")) {
      const filename = path.basename(featureImage.image);
      const uploadsDir = path.join(__dirname, "../../uploads");
      const filePath = path.join(uploadsDir, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Deleted file:", filePath);
      }
    }

    // Delete from database
    await Feature.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Feature image deleted successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = { addFeatureImage, getFeatureImages, deleteFeatureImage };