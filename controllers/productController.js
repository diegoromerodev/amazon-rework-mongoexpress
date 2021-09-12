const { body, checkSchema, validationResult } = require("express-validator");
const multer = require("multer");
const async = require("async");
const Review = require("../models/review");
const Product = require("../models/product");
const product = require("../models/product");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const path = `./public/uploads/reviews`;
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

// CREATE REVIEW GET
exports.review_create_get = (req, res, next) => {
  Product.findById(req.params.prodid).exec((err, prodData) => {
    if (err) return next(err);
    if (!prodData) return next(404);
    // PRODUCT FOUND AND NO ERRORS
    return res.render("review_form", {
      title: "Add a new review for ",
      product: prodData,
    });
  });
};

exports.review_create_post = [
  upload.single("image"),
  // VALIDATION CHECKS
  body("author", "Author name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("text", "Message text is mandatory").trim().notEmpty().escape(),
  body("rating", "Please specify a rating").trim().notEmpty().escape(),
  checkSchema({
    image: {
      custom: {
        options: (value, { req }) => !!req.file,
        errorMessage: "You need to upload an image (jpg, png, gif) < 5MB",
      },
    },
  }),
  // PROCESSING MIDDLEWARE
  (req, res, next) => {
    return async
      .parallel({
        product: (callback) => {
          Product.findById(req.body["review-product"]).exec(callback);
        },
        reviewDuplicate: (callback) => {
          Review.findOne({
            author: { $regex: new RegExp(req.body.author, "i") },
          }).exec(callback);
        },
      })
      .then((results) => {
        if (!results.product) return next(new Error(404));
        if (results.reviewDuplicate) return res.redirect(results.product.url);
        // NO DUPES OR ERRORS
        const newReview = new Review({
          product: results.product,
          rating: req.body.rating,
          author: req.body.author,
          text: req.body.text,
          image: req.file?.filename,
        });
        const valErrors = validationResult(req);
        if (!valErrors.isEmpty()) {
          return res.render("review_form", {
            title: "Add a new review for ",
            errors: valErrors.array().concat([]),
            product: results.product,
            newReview,
          });
        }
        return newReview.save((error) => {
          if (error) {
            return next(error);
          }
          return res.redirect(newReview.product.url);
        });
      })
      .catch((err) => next(err));
  },
];
