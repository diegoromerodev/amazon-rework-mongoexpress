const mongoose = require("mongoose");

const { Schema } = mongoose;

const BrandSchema = new Schema({
  name: String,
  logo: String,
});

BrandSchema.virtual("url").get(function getUrl() {
  return `/brand/${this._id}`;
});

module.exports = mongoose.model("Brand", BrandSchema);
