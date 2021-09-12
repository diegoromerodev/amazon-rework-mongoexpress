const express = require("express");
const brandController = require("../controllers/brandController");
const categoryController = require("../controllers/categoryController");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

/* GET home page. */
router.get("/", (req, res) => {
  res.render("index");
});

router.get("/categories", categoryController.categories_showcase);

router.get("/brands", brandController.brands_showcase);

router.get("/create", (req, res) => {
  res.send(`NOT IMPLEMENTED PRODUCT CREATE GET`);
});

router.post("/create", (req, res) => {
  res.send(`NOT IMPLEMENTED PRODUCT CREATE POST`);
});

router.get("/:prodid", (req, res) => {
  res.send(`NOT IMPLEMENTED PRODUCT DETAILS ID: ${req.params.prodid}`);
});

router.get("/:prodid/update", (req, res) => {
  res.send(`NOT IMPLEMENTED PRODUCT UPDATE GET ID: ${req.params.prodid}`);
});

router.post("/:prodid/update", (req, res) => {
  res.send(`NOT IMPLEMENTED PRODUCT UPDATE POST ID: ${req.params.prodid}`);
});

router.get("/:prodid/delete", (req, res) => {
  res.send(`NOT IMPLEMENTED PRODUCT DELETE GET ID: ${req.params.prodid}`);
});

router.post("/:prodid/delete", (req, res) => {
  res.send(`NOT IMPLEMENTED PRODUCT DELETE POST ID: ${req.params.prodid}`);
});

router.get("/:prodid/review", reviewController.review_create_get);

router.post("/:prodid/review", reviewController.review_create_post);

router.get("/:prodid/:reviewid/update", (req, res) => {
  res.send(
    `NOT IMPLEMENTED PRODUCT REVIEW UPDATE GET ID: ${req.params.prodid}`
  );
});

router.post("/:prodid/:reviewid/update", (req, res) => {
  res.send(
    `NOT IMPLEMENTED PRODUCT REVIEW UPDATE POST ID: ${req.params.prodid}`
  );
});

router.get("/:prodid/:reviewid/delete", (req, res) => {
  res.send(
    `NOT IMPLEMENTED PRODUCT REVIEW DELETE GET ID: ${req.params.prodid}`
  );
});

router.post("/:prodid/:reviewid/delete", (req, res) => {
  res.send(
    `NOT IMPLEMENTED PRODUCT REVIEW DELETE POST ID: ${req.params.prodid}`
  );
});

module.exports = router;
