const { body, validationResult } = require("express-validator");
const multer = require("multer");
const Brand = require("../models/brand");

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
  Brand.find().exec((err, brands) => {
    if (err) {
      return next(err);
    }
    if (!brands) {
      return next(new Error(404));
    }
    return res.render("brands_showcase", { title: "Amazon Brands", brands });
  });
};
