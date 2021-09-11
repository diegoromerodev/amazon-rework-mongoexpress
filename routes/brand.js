const express = require("express");
const brandController = require("../controllers/brandController");

const router = express.Router();

router.get("/create", brandController.brand_create_get);

router.post("/create", brandController.brand_create_post);

router.get("/:brandid", (req, res) => {
  res.send(`NOT IMPLEMENTED BRAND DETAILS ID: ${req.params.brandid}`);
});

router.get("/:brandid/update", (req, res) => {
  res.send(`NOT IMPLEMENTED BRAND UPDATE GET ID: ${req.params.brandid}`);
});

router.post("/:brandid/update", (req, res) => {
  res.send(`NOT IMPLEMENTED BRAND UPDATE POST ID: ${req.params.brandid}`);
});

router.get("/:brandid/delete", (req, res) => {
  res.send(`NOT IMPLEMENTED BRAND DELETE GET ID: ${req.params.brandid}`);
});

router.post("/:brandid/delete", (req, res) => {
  res.send(`NOT IMPLEMENTED BRAND DELETE POST ID: ${req.params.brandid}`);
});

module.exports = router;
