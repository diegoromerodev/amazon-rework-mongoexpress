const mongoose = require("mongoose");

const { Schema } = mongoose;

const BrandSchema = new Schema({
  name: String,
  logo: String,
});

BrandSchema.virtual("url").get(function getUrl() {
  return `/brand/${this.name.toLowerCase()}`;
});

module.exports = mongoose.model("Brand", BrandSchema);
