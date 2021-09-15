const async = require("async");
const Product = require("../models/product");
const Category = require("../models/category");
const Brand = require("../models/brand");

exports.index_get = (req, res, next) => {
  async.parallel(
    {
      brands(callback) {
        Brand.find().limit(6).exec(callback);
      },
      products(callback) {
        Product.find().limit(5).populate("brand").exec(callback);
      },
      categories(callback) {
        Category.find().exec(callback);
      },
    },
    (err, results) => {
      if (err) next(err);
      res.render("index", {
        title: "Home",
        brands: results.brands,
        products: results.products,
        categories: results.categories,
      });
    }
  );
};
