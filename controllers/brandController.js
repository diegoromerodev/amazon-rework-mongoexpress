const { body, validationResult } = require("express-validator");
const multer = require("multer");
const Brand = require("../models/brand");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const path = `./public/uploads`;
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
}).single("logo");

exports.brand_create_get = (req, res) => {
  res.render("brand_form", { title: "Add a new brand" });
};

exports.brand_create_post = [
  (req, res, next) => {
    upload(req, res, function catchError(err) {
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
    const newBrand = new Brand({ name, path: req.file.path });
    Brand.findOne({ name: { $regex: new RegExp(newBrand.name, "i") } }).exec(
      (errors, result) => {
        if (result) {
          res.redirect(`/brand/${result._id}`);
          return;
        }
        newBrand.save((error) => {
          if (error) {
            return next(error);
          }
          return res.redirect("/brands");
        });
      }
    );
  },
];
