const express = require("express");
const brandController = require("../controllers/brandController");

const router = express.Router();

router.get("/create", brandController.brand_create_get);

router.post("/create", brandController.brand_create_post);

router.get("/:brandid", brandController.brand_details);

router.get("/:brandid/update", brandController.brand_update_get);

router.post("/:brandid/update", brandController.brand_update_post);

router.get("/:brandid/delete", brandController.brand_delete_get);

router.post("/:brandid/delete", brandController.brand_delete_post);

module.exports = router;
