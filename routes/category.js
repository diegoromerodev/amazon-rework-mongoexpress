const express = require("express");

const router = express.Router();

router.get("/create", (req, res) => {
  res.send(`NOT IMPLEMENTED CATEGORY CREATE GET`);
});

router.post("/create", (req, res) => {
  res.send(`NOT IMPLEMENTED CATEGORY CREATE POST`);
});

router.get("/:catid", (req, res) => {
  res.send(`NOT IMPLEMENTED CATEGORY DETAILS ID: ${req.params.catid}`);
});

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
