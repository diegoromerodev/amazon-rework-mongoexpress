const express = require("express");
const brandController = require("../controllers/brandController");

const router = express.Router();

/* GET home page. */
router.get("/", (req, res) => {
  res.render("index");
});

router.get("/categories", (req, res) => {
  res.send(`NOT IMPLEMENTED CAT SHOWCASE`);
});

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

module.exports = router;
