const { body, checkSchema, validationResult } = require("express-validator");
const multer = require("multer");
const async = require("async");
const Review = require("../models/review");
const Product = require("../models/product");
const Category = require("../models/category");

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
  async.parallel(
    {
      product(callback) {
        Product.findById(req.params.prodid).exec(callback);
      },
      categories(callback) {
        Category.find().exec(callback);
      },
    },
    (err, { product, categories }) => {
      if (err) return next(err);
      if (!product) return next(404);
      // PRODUCT FOUND AND NO ERRORS
      res.render("review_form", {
        title: "Add a new review for ",
        product,
        categories,
      });
    }
  );
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
            author: { $regex: new RegExp(`^${req.body.author}$`, "i") },
          }).exec(callback);
        },
        categories(callback) {
          Category.find().exec(callback);
        },
      })
      .then((results) => {
        if (!results.product) return next(new Error(404));
        if (results.reviewDuplicate && req.body.author)
          return res.redirect(results.product.url);
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
          res.render("review_form", {
            title: "Add a new review for ",
            errors: valErrors.array().concat([]),
            product: results.product,
            newReview,
            categories: results.categories,
          });
          return;
        }
        newReview.save((error) => {
          if (error) {
            return next(error);
          }
          res.redirect(newReview.product.url);
        });
      })
      .catch((err) => next(err));
  },
];

// UPDATE REVIEW GET
exports.review_update_get = (req, res, next) => {
  async.parallel(
    {
      product(callback) {
        Product.findById(req.params.prodid).exec(callback);
      },
      categories(callback) {
        Category.find().exec(callback);
      },
      review(callback) {
        Review.findById(req.params.reviewid).exec(callback);
      },
    },
    (err, { product, categories, review }) => {
      if (err) return next(err);
      if (!product) return next(404);
      // PRODUCT FOUND AND NO ERRORS
      res.render("review_form", {
        title: "Edit review for ",
        product,
        categories,
        newReview: review,
        admin: true,
      });
    }
  );
};

exports.review_update_post = [
  upload.single("image"),
  // VALIDATION CHECKS
  body("author", "Author name is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("text", "Message text is mandatory").trim().notEmpty().escape(),
  body("rating", "Please specify a rating").trim().notEmpty().escape(),
  body("password", "Wrong password").trim().equals("admin123").escape(),
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
        categories(callback) {
          Category.find().exec(callback);
        },
      })
      .then((results) => {
        if (!results.product) return next(new Error(404));
        // NO DUPES OR ERRORS
        const newReview = {
          rating: req.body.rating,
          author: req.body.author,
          text: req.body.text,
          image: req.file?.filename,
        };
        const valErrors = validationResult(req);
        if (!valErrors.isEmpty()) {
          res.render("review_form", {
            title: "Add a new review for ",
            errors: valErrors.array().concat([]),
            product: results.product,
            newReview,
            categories: results.categories,
            admin: true,
          });
          return;
        }
        Review.findByIdAndUpdate(
          req.params.reviewid,
          newReview,
          {},
          (err, review) => {
            if (err) return next(err);
            res.redirect(results.product.url);
          }
        );
      })
      .catch((err) => next(err));
  },
];

exports.review_delete_get = (req, res, next) => {
  async.parallel(
    {
      categories(callback) {
        Category.find().exec(callback);
      },
      review(callback) {
        Review.findById(req.params.reviewid).exec(callback);
      },
    },
    (err, { categories, review }) => {
      if (err) return next(err);
      if (!review) return next(404);
      res.render("review_delete", {
        title: "Delete a review",
        review,
        categories,
      });
    }
  );
};

exports.review_delete_post = [
  body("password", "Wrong password").trim().equals("admin123").escape(),
  (req, res, next) => {
    async.parallel(
      {
        categories(callback) {
          Category.find().exec(callback);
        },
        review(callback) {
          Review.findById(req.params.reviewid).exec(callback);
        },
      },
      (err, { review, categories }) => {
        const valErrors = validationResult(req);
        if (!valErrors.isEmpty()) {
          res.render("review_delete", {
            title: "Delete a review",
            review,
            categories,
            errors: valErrors.array(),
          });
          return;
        }
        Review.findByIdAndDelete(req.params.reviewid, (error, docs) => {
          if (error) return next(error);
          if (!docs) return next(404);
          res.redirect(`/${req.params.prodid}`);
        });
      }
    );
  },
];
