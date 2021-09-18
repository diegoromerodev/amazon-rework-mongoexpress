const express = require("express");
const categoryController = require("../controllers/categoryController");

const router = express.Router();

router.get("/create", categoryController.category_create_get);

router.post("/create", categoryController.category_create_post);

router.get("/:catid", categoryController.category_details);

router.get("/:catid/update", categoryController.category_update_get);

router.post("/:catid/update", categoryController.category_update_post);

router.get("/:catid/delete", categoryController.category_delete_get);

router.post("/:catid/delete", categoryController.category_delete_post);

module.exports = router;
