const { body, validationResult } = require("express-validator");
const async = require("async");
const Category = require("../models/category");
const Product = require("../models/product");

exports.category_create_get = (req, res, next) => {
  Category.find().exec((err, categories) => {
    if (err) return next(err);
    if (!categories) return next(404);
    res.render("category_form", {
      title: "Create new category",
      categories,
    });
  });
};

exports.category_create_post = [
  body("name", "Must specify a category name").trim().notEmpty().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      Category.find().exec((err, categories) => {
        if (err) return next(err);
        if (!categories) return next(404);
        res.render("category_form", {
          title: "Create new category",
          name: req.body.name,
          errors: errors.array(),
          categories,
        });
      });
      return;
    }
    // VALIDATION SUCCESSFUL
    Category.findOne({
      name: { $regex: new RegExp(req.body.name, "i") },
    }).exec((err, catDuplicate) => {
      if (err) {
        return next(err);
      }
      if (catDuplicate)
        return res.redirect(`/category/${catDuplicate.name.toLowerCase()}`);
      // NO DUPES
      const newCat = new Category({ name: req.body.name });
      newCat.save((error) => {
        if (error) return next(error);
        return res.redirect("/categories");
      });
    });
  },
];

exports.categories_showcase = (req, res, next) => {
  Category.find().exec((err, result) => {
    if (err) return next(err);
    if (!result) {
      return next(new Error(404));
    }
    return res.render("categories_showcase", {
      title: "Amazon Categories",
      categories: result,
    });
  });
};

exports.category_details = (req, res, next) => {
  const categoryName = req.params.catid;
  async.series(
    {
      category(callback) {
        Category.findOne({
          name: { $regex: new RegExp(categoryName, "i") },
        }).exec(callback);
      },
      categories(callback) {
        Category.find().exec(callback);
      },
    },
    (err, { category, categories }) => {
      if (err) return next(err);
      if (!category) return next(404);
      if (!categories) return next(404);
      Product.find()
        .where("category")
        .equals(category._id)
        .exec((error, products) => {
          if (error) return next(error);
          res.render("category_details", {
            title: categoryName[0].toUpperCase() + categoryName.substr(1),
            category,
            categories,
            products,
          });
        });
    }
  );
};

exports.category_update_get = (req, res, next) => {
  async.parallel(
    {
      categories(callback) {
        Category.find().exec(callback);
      },
      category(callback) {
        Category.findOne({
          name: { $regex: new RegExp(req.params.catid, "i") },
        }).exec(callback);
      },
    },
    (err, { categories, category }) => {
      if (err) return next(err);
      if (!categories || !category) return next(404);
      res.render("category_form", {
        title: "Edit category",
        name: category.name,
        categories,
      });
    }
  );
};

exports.category_update_post = [
  body("name", "Must specify a category name").trim().notEmpty().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      Category.find().exec((err, categories) => {
        if (err) return next(err);
        if (!categories) return next(404);
        res.render("category_form", {
          title: "Edit category",
          name: req.body.name,
          errors: errors.array(),
          categories,
        });
      });
      return;
    }
    // VALIDATION SUCCESSFUL
    Category.findOne({
      name: { $regex: new RegExp(req.body.name, "i") },
    }).exec((err, catDuplicate) => {
      if (err) {
        return next(err);
      }
      if (catDuplicate)
        return res.redirect(`/category/${catDuplicate.name.toLowerCase()}`);
      // NO DUPES
      const newCat = { name: req.body.name };
      Category.findOneAndUpdate(
        {
          name: { $regex: new RegExp(req.params.catid, "i") },
        },
        newCat,
        {},
        (error, cat) => {
          if (error) return next(error);
          res.redirect("/categories");
        }
      );
    });
  },
];

exports.category_delete_get = (req, res, next) => {
  async.parallel(
    {
      categories(callback) {
        Category.find().exec(callback);
      },
      category(callback) {
        Category.findOne({
          name: { $regex: new RegExp(`^${req.params.catid}$`, "i") },
        }).exec(callback);
      },
    },
    (err, { categories, category }) => {
      if (err) return next(err);
      if (!category) return next(404);
      res.render("category_delete", {
        title: `Delete ${category.name}`,
        category,
        categories,
      });
    }
  );
};

exports.category_delete_post = (req, res, next) => {
  const categoryQuery = Category.findOne({
    name: { $regex: new RegExp(`^${req.params.catid}$`, "i") },
  });
  categoryQuery.exec((err, result) => {
    if (err) return next(err);
    if (!result) return next(404);
    Product.find()
      .where("category")
      .equals(result._id)
      .deleteMany({}, (error) => {
        if (error) return next(error);
      });
    categoryQuery.clone().deleteOne({}, (lastErr, docs) => {
      if (lastErr) return next(lastErr);
      if (!docs) return next(404);
      res.redirect("/categories");
    });
  });
};
