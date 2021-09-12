const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const { Schema } = mongoose;

const ReviewSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product" },
  image: String,
  review_date: Date,
  rating: Number,
  author: String,
  text: String,
});

ReviewSchema.virtual("formatted_date").get(function getFormattedDate() {
  return DateTime.fromJSDate(this.review_date).toLocaleString(
    DateTime.DATE_FULL
  );
});

module.exports = mongoose.model("Review", ReviewSchema);
