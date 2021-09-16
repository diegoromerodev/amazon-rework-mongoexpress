const { body, validationResult } = require("express-validator");
const multer = require("multer");
const async = require("async");
const Brand = require("../models/brand");
const Category = require("../models/category");
const Product = require("../models/product");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const path = `./public/uploads/logos`;
    cb(null, path);
  },
  filename(req, file, cb) {
    cb(null, Date.now() + file.originalname.replace(/\s+/g, "-"));
  },
});

function checkImgErrors(req, file, cb) {
  console.log(file);
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
}).single("logo");

// CREATE BRAND GET
exports.brand_create_get = (req, res) => {
  res.render("brand_form", { title: "Add a new brand" });
};

// CREATE BRAND POST
exports.brand_create_post = [
  (req, res, next) => {
    upload(req, res, function catchError(err) {
      if (!req.file) {
        return next([new Error("Logo is required")]);
      }
      if (!err) {
        return next([]);
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        return next([new Error("File size is too big.")]);
      }
      return next([err]);
    });
  },
  body("name", "Brand name is required").trim().notEmpty().escape(),
  (imgErrors, req, res, next) => {
    const { name } = req.body;
    const valErrors = validationResult(req);
    if (!valErrors.isEmpty() || imgErrors.length) {
      res.render("brand_form", {
        title: "Add a new brand",
        errors: valErrors.array().concat(imgErrors),
        name,
      });
      return;
    }
    // NO ERRORS DURING VALIDATION
    const newBrand = new Brand({
      name,
      logo: req.file.filename,
    });
    Brand.findOne({ name: { $regex: new RegExp(newBrand.name, "i") } }).exec(
      (errors, brandDuplicate) => {
        if (errors) return next(errors);
        if (brandDuplicate) {
          return res.redirect(`/brand/${brandDuplicate.name.toLowerCase()}`);
        }
        // NO DUPES
        return newBrand.save((error) => {
          if (error) {
            return next(error);
          }
          return res.redirect("/brands");
        });
      }
    );
  },
];

exports.brands_showcase = (req, res, next) => {
  async.parallel(
    {
      brands(callback) {
        Brand.find().exec(callback);
      },
      categories(callback) {
        Category.find().exec(callback);
      },
    },
    (err, { categories, brands }) => {
      if (err) {
        return next(err);
      }
      if (!brands) {
        return next(new Error(404));
      }
      return res.render("brands_showcase", {
        title: "Amazon Brands",
        brands,
        categories,
      });
    }
  );
};

exports.brand_details = (req, res, next) => {
  const brandName = req.params.brandid;
  async.series(
    {
      brand(callback) {
        Brand.findOne({
          name: { $regex: new RegExp(brandName, "i") },
        }).exec(callback);
      },
      categories(callback) {
        Category.find().exec(callback);
      },
    },
    (err, { brand, categories }) => {
      if (err) return next(err);
      if (!brand) return next(404);
      if (!categories) return next(404);
      Product.find()
        .where("brand")
        .equals(brand._id)
        .exec((error, products) => {
          if (error) return next(error);
          res.render("brand_details", {
            title: brandName,
            brand,
            categories,
            products,
          });
        });
    }
  );
};
