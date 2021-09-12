const { body, validationResult } = require("express-validator");
const Category = require("../models/category");

exports.category_create_get = (req, res) => {
  res.render("category_form", { title: "Create new category" });
};

exports.category_create_post = [
  body("name", "Must specify a category name").trim().notEmpty().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("category_form", {
        title: "Create new category",
        name: req.body.name,
        errors: errors.array(),
      });
    }
    // VALIDATION SUCCESSFUL
    return Category.findOne({
      name: { $regex: new RegExp(req.body.name, "i") },
    }).exec((err, catDuplicate) => {
      if (err) {
        return next(err);
      }
      if (catDuplicate)
        return res.redirect(`/category/${catDuplicate.name.toLowerCase()}`);
      // NO DUPES
      const newCat = new Category({ name: req.body.name });
      return newCat.save((error) => {
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
