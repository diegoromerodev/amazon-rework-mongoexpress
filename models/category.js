const mongoose = require("mongoose");

const { Schema } = mongoose;

const CategorySchema = new Schema({
  name: String,
});

CategorySchema.virtual("url").get(function getUrl() {
  return `/category/${this.name.toLowerCase()}`;
});

module.exports = mongoose.model("Category", CategorySchema);
