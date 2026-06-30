const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    label: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Brand", BrandSchema);