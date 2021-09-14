const { body, checkSchema, validationResult } = require("express-validator");
const multer = require("multer");
const async = require("async");
const Product = require("../models/product");
const Category = require("../models/category");
const Brand = require("../models/brand");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const path = `./public/uploads/products`;
    cb(null, path);
  },
  filename(req, file, cb) {
    cb(null, Date.now() + file.originalname.replace(/\s+/g, "-"));
  },
});

function checkImgErrors(req, file, cb) {
  if (!file.mimetype.match(/^image/)) {
    cb(new Error("Only images allowed."));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter(req, file, callback) {
    checkImgErrors(req, file, callback);
  },
});

// CREATE PRODUCT GET
exports.product_create_get = (req, res, next) => {
  async
    .parallel({
      allBrands: (callback) => Brand.find().exec(callback),
      allCats: (callback) => Category.find().exec(callback),
    })
    .then((results) => {
      res.render("product_form", {
        title: "Add a new product",
        brands: results.allBrands,
        categories: results.allCats,
      });
    })
    .catch((err) => next(err));
};

exports.product_create_post = [
  upload.single("image"),
  // VALIDATION CHECKS
  body("name", "Product name is required").trim().notEmpty().escape(),
  body("description", "Product description is mandatory")
    .trim()
    .notEmpty()
    .escape(),
  body("price", "Please specify product price").trim().notEmpty().escape(),
  body("brand", "Please select a brand").trim().notEmpty().escape(),
  body("category", "Please select a product category")
    .trim()
    .notEmpty()
    .escape(),
  checkSchema({
    image: {
      custom: {
        options: (value, { req }) => !!req.file,
        errorMessage:
          "You need to upload a product image (jpg, png, gif) < 5MB",
      },
    },
  }),
  // PROCESSING MIDDLEWARE
  (req, res, next) => {
    console.log(req.body);
    async
      .parallel({
        category: (callback) =>
          Category.findById(req.body.category).exec(callback),
        brand: (callback) => Brand.findById(req.body.brand).exec(callback),
        allBrands: (callback) => Brand.find().exec(callback),
        allCats: (callback) => Category.find().exec(callback),
      })
      .then((results) => {
        const newProduct = new Product({
          publish_date: Date.now(),
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          image: req.file?.filename,
          category: results.category,
          brand: results.brand,
        });
        const valErrors = validationResult(req);
        if (!valErrors.isEmpty() || !results.brand || !results.category) {
          return res.render("product_form", {
            title: "Add a new product",
            errors: valErrors.array().concat([]),
            brands: results.allBrands,
            categories: results.allCats,
            product: newProduct,
          });
        }
        return newProduct.save((error) => {
          if (error) {
            return next(error);
          }
          return res.redirect(newProduct.url);
        });
      })
      .catch((err) => next(err));
  },
];
