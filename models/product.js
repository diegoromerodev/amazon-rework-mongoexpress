const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const { Schema } = mongoose;

const ProductSchema = new Schema({
  publish_date: Date,
  name: String,
  description: String,
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  price: Number,
  review: { type: Schema.Types.ObjectId, ref: "Review" },
  brand: { type: Schema.Types.ObjectId, ref: "Brand" },
});

ProductSchema.virtual("url").get(function getUrl() {
  return `/${this._id}`;
});

ProductSchema.virtual("formatted_date").get(function getFormattedDate() {
  return DateTime.fromJSDate(this.publish_date).toLocaleString(
    DateTime.DATE_FULL
  );
});

module.exports = mongoose.model("Product", ProductSchema);
