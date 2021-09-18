const express = require("express");
const brandController = require("../controllers/brandController");
const categoryController = require("../controllers/categoryController");
const reviewController = require("../controllers/reviewController");
const productController = require("../controllers/productController");

const router = express.Router();

/* GET home page. */
router.get("/:prodid/review", reviewController.review_create_get);

router.post("/:prodid/review", reviewController.review_create_post);

router.get("/:prodid/:reviewid/update", reviewController.review_update_get);

router.post("/:prodid/:reviewid/update", reviewController.review_update_post);

router.get("/:prodid/:reviewid/delete", reviewController.review_delete_get);

router.post("/:prodid/:reviewid/delete", reviewController.review_delete_post);

router.get("/", require("../controllers/indexController").index_get);

router.get("/search", require("../controllers/indexController").search_get);

router.get("/categories", categoryController.categories_showcase);

router.get("/brands", brandController.brands_showcase);

router.get("/create", productController.product_create_get);

router.post("/create", productController.product_create_post);

router.get("/:prodid", productController.product_details_get);

router.get("/:prodid/update", productController.product_update_get);

router.post("/:prodid/update", productController.product_update_post);

router.get("/:prodid/delete", productController.product_delete_get);

router.post("/:prodid/delete", productController.product_delete_post);

module.exports = router;
