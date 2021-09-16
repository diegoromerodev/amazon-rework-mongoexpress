const async = require("async");
const MiniSearch = require("minisearch");
const Product = require("../models/product");
const Category = require("../models/category");
const Brand = require("../models/brand");

exports.index_get = (req, res, next) => {
  async.parallel(
    {
      brands(callback) {
        Brand.find().limit(5).exec(callback);
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

exports.search_get = (req, res, next) => {
  async.parallel(
    {
      brands(callback) {
        Brand.find().exec(callback);
      },
      products(callback) {
        Product.find().populate("brand").exec(callback);
      },
      categories(callback) {
        Category.find().exec(callback);
      },
    },
    (err, results) => {
      if (err) next(err);
      const { brands, products, categories } = results;
      const allDocs = brands.concat(products, categories);
      const brandResults = [];
      const productResults = [];
      const categoryResults = [];
      const miniSearch = new MiniSearch({
        fields: ["name", "description"],
        storeFields: ["name", "brand", "price", "logo", "image", "url"],
        fuzzy: 0.2,
      });
      miniSearch.addAll(allDocs);
      const searchResults = miniSearch.search(req.query.query);
      searchResults.forEach((el) => {
        if ("logo" in el) brandResults.push(el);
        if (!("logo" in el) && !("price" in el)) categoryResults.push(el);
        if ("price" in el) productResults.push(el);
      });
      res.render("search_results", {
        title: `Searching ${req.query.query}`,
        categories: results.categories,
        categoryResults,
        productResults,
        brandResults,
      });
    }
  );
};
