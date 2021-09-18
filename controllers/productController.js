const { body, checkSchema, validationResult } = require("express-validator");
const multer = require("multer");
const async = require("async");
const currencyFormatter = require("currency-formatter");
const Product = require("../models/product");
const Category = require("../models/category");
const Brand = require("../models/brand");
const Review = require("../models/review");

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
          price: currencyFormatter.format(parseFloat(req.body.price), {
            code: "USD",
          }),
          image: req.file?.filename,
          category: results.category,
          brand: results.brand,
        });
        const valErrors = validationResult(req);
        if (!valErrors.isEmpty() || !results.brand || !results.category) {
          return res.render("product_form", {
            title: "Add a new product",
            errors: valErrors.array(),
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

exports.product_details_get = (req, res, next) => {
  async
    .parallel({
      product: (callback) =>
        Product.findById(req.params.prodid)
          .populate("brand")
          .populate("category")
          .exec(callback),
      categories: (callback) => Category.find().exec(callback),
      allProds: (callback) => Product.find().exec(callback),
      reviews: (callback) =>
        Review.find().where("product").equals(req.params.prodid).exec(callback),
    })
    .then((results) => {
      if (!results) next(404);
      const randomProds = [];
      let i = 0;
      while (i < 6) {
        const item =
          results.allProds[Math.floor(Math.random() * results.allProds.length)];
        if (randomProds.includes(item) || item.name === results.product.name)
          continue;
        randomProds.push(item);
        i++;
      }
      const stats = results.reviews.reduce(
        (acc, curr) => {
          acc.numOfReviews += 1;
          acc.total += parseFloat(curr.rating);
          return acc;
        },
        { numOfReviews: 0, total: 0 }
      );
      res.render("product_details", {
        title: results.product.name,
        product: results.product,
        categories: results.categories,
        products: randomProds,
        reviews: results.reviews,
        stats,
      });
    })
    .catch((err) => next(err));
};

exports.product_update_get = (req, res, next) => {
  async.parallel(
    {
      categories(callback) {
        Category.find().exec(callback);
      },
      product(callback) {
        Product.findById(req.params.prodid)
          .populate("brand")
          .populate("category")
          .exec(callback);
      },
      brands(callback) {
        Brand.find().exec(callback);
      },
    },
    (err, { brands, categories, product }) => {
      if (err) return next(err);
      if (!product) return next(404);
      res.render("product_form", {
        title: `Editing ${product.name}`,
        product,
        categories,
        brands,
        admin: true,
      });
    }
  );
};

exports.product_update_post = [
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
  body("password", "Wrong password").trim().equals("admin123").escape(),
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
    async
      .parallel({
        category: (callback) =>
          Category.findById(req.body.category).exec(callback),
        brand: (callback) => Brand.findById(req.body.brand).exec(callback),
        allBrands: (callback) => Brand.find().exec(callback),
        allCats: (callback) => Category.find().exec(callback),
      })
      .then((results) => {
        const newProduct = {
          publish_date: Date.now(),
          name: req.body.name,
          description: req.body.description,
          price: currencyFormatter.format(
            parseFloat(req.body.price.replace("$", "").replace(",", "")),
            {
              code: "USD",
            }
          ),
          image: req.file?.filename,
          category: results.category,
          brand: results.brand,
        };
        const valErrors = validationResult(req);
        if (!valErrors.isEmpty() || !results.brand || !results.category) {
          return res.render("product_form", {
            title: `Edit ${newProduct.name}`,
            errors: valErrors.array(),
            brands: results.allBrands,
            categories: results.allCats,
            product: newProduct,
            admin: true,
          });
        }
        Product.findByIdAndUpdate(
          req.params.prodid,
          newProduct,
          {},
          (err, prod) => {
            if (err) return next(err);
            if (!prod) return next(404);
            res.redirect(prod.url);
          }
        );
      })
      .catch((err) => next(err));
  },
];

exports.product_delete_get = (req, res, next) => {
  async.parallel(
    {
      categories(callback) {
        Category.find().exec(callback);
      },
      product(callback) {
        Product.findById(req.params.prodid)
          .populate("brand")
          .populate("category")
          .exec(callback);
      },
    },
    (err, { categories, product }) => {
      if (err) return next(err);
      if (!product) return next(404);
      res.render("product_delete", {
        title: `Delete ${product.name}`,
        product,
        categories,
      });
    }
  );
};

exports.product_delete_post = [
  body("password", "Wrong password").trim().equals("admin123").escape(),
  // PROCESSING MIDDLEWARE
  (req, res, next) => {
    const valErrors = validationResult(req);
    if (!valErrors.isEmpty()) {
      async.parallel(
        {
          categories(callback) {
            Category.find().exec(callback);
          },
          product(callback) {
            Product.findById(req.params.prodid)
              .populate("brand")
              .populate("category")
              .exec(callback);
          },
        },
        (err, { categories, product }) => {
          if (err) return next(err);
          if (!product) return next(404);
          res.render("product_delete", {
            title: `Delete ${product.name}`,
            product,
            categories,
            errors: valErrors.array(),
          });
        }
      );
      return;
    }
    Product.findByIdAndDelete(req.params.prodid, (err, docs) => {
      if (err) return next(err);
      if (!docs) return next(404);
    });
    Review.find()
      .where("product")
      .equals(req.params.prodid)
      .deleteMany({}, (err) => {
        if (err) return next(404);
        res.redirect("/");
      });
  },
];
