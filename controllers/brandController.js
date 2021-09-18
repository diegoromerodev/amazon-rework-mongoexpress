const { body, validationResult, checkSchema } = require("express-validator");
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

// CREATE BRAND GET
exports.brand_create_get = (req, res, next) => {
  Category.find().exec((err, categories) => {
    if (err) return next(err);
    if (!categories) return next(404);
    res.render("brand_form", { title: "Add a new brand", categories });
  });
};

// CREATE BRAND POST
exports.brand_create_post = [
  upload.single("logo"),
  body("name", "Brand name is required").trim().notEmpty().escape(),
  checkSchema({
    image: {
      custom: {
        options: (value, { req }) => !!req.file,
        errorMessage: "You need to upload a brand logo (jpg, png, gif) < 5MB",
      },
    },
  }),
  (req, res, next) => {
    Category.find().exec((err, categories) => {
      const { name } = req.body;
      const valErrors = validationResult(req);
      if (!valErrors.isEmpty()) {
        res.render("brand_form", {
          title: "Add a new brand",
          errors: valErrors.array(),
          name,
          categories,
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
    });
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
            title: brandName.toUpperCase(),
            brand,
            categories,
            products,
          });
        });
    }
  );
};

exports.brand_update_get = (req, res, next) => {
  async.parallel(
    {
      categories(callback) {
        Category.find().exec(callback);
      },
      brand(callback) {
        Brand.findOne({
          name: { $regex: new RegExp(req.params.brandid, "i") },
        }).exec(callback);
      },
    },
    (err, { categories, brand }) => {
      if (err) return next(err);
      if (!brand) return next(404);
      res.render("brand_form", {
        title: `Edit ${brand.name}`,
        categories,
        name: brand.name,
      });
    }
  );
};

// UPDATE BRAND POST
exports.brand_update_post = [
  upload.single("logo"),
  body("name", "Brand name is required").trim().notEmpty().escape(),
  checkSchema({
    image: {
      custom: {
        options: (value, { req }) => !!req.file,
        errorMessage: "You need to upload a brand logo (jpg, png, gif) < 5MB",
      },
    },
  }),
  (req, res, next) => {
    Category.find().exec((err, categories) => {
      const { name } = req.body;
      const valErrors = validationResult(req);
      if (!valErrors.isEmpty()) {
        res.render("brand_form", {
          title: `Edit ${req.params.brandid}`,
          errors: valErrors.array(),
          name,
          categories,
        });
        return;
      }
      // NO ERRORS DURING VALIDATION
      Brand.findOne({
        name: { $regex: new RegExp(req.params.brandid, "i") },
      }).exec((err, result) => {
        if (err) next(err);
        result.name = name;
        result.logo = req.file.filename;
        result.save();
        res.redirect("/brands");
      });
    });
  },
];

exports.brand_delete_get = (req, res, next) => {
  async.parallel(
    {
      categories(callback) {
        Category.find().exec(callback);
      },
      brand(callback) {
        Brand.findOne({
          name: { $regex: new RegExp(`^${req.params.brandid}$`, "i") },
        }).exec(callback);
      },
    },
    (err, { categories, brand }) => {
      if (err) return next(err);
      if (!brand) return next(404);
      res.render("brand_delete", {
        title: `Delete ${brand.name}`,
        brand,
        categories,
      });
    }
  );
};

exports.brand_delete_post = (req, res, next) => {
  const brandQuery = Brand.findOne({
    name: { $regex: new RegExp(`^${req.params.brandid}$`, "i") },
  });
  brandQuery.exec((err, result) => {
    if (err) return next(err);
    if (!result) return next(404);
    Product.find()
      .where("brand")
      .equals(result._id)
      .deleteMany({}, (error) => {
        if (error) return next(error);
      });
    brandQuery.clone().deleteOne({}, (lastErr, docs) => {
      if (lastErr) return next(lastErr);
      if (!docs) return next(404);
      res.redirect("/brands");
    });
  });
};
