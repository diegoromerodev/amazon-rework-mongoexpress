const express = require("express");
const categoryController = require("../controllers/categoryController");

const router = express.Router();

router.get("/create", categoryController.category_create_get);

router.post("/create", categoryController.category_create_post);

router.get("/:catid", categoryController.category_details);

router.get("/:catid/update", (req, res) => {
  res.send(`NOT IMPLEMENTED CATEGORY UPDATE GET ID: ${req.params.catid}`);
});

router.post("/:catid/update", (req, res) => {
  res.send(`NOT IMPLEMENTED CATEGORY UPDATE POST ID: ${req.params.catid}`);
});

router.get("/:catid/delete", (req, res) => {
  res.send(`NOT IMPLEMENTED CATEGORY DELETE GET ID: ${req.params.catid}`);
});

router.post("/:catid/delete", (req, res) => {
  res.send(`NOT IMPLEMENTED CATEGORY DELETE POST ID: ${req.params.catid}`);
});

module.exports = router;
