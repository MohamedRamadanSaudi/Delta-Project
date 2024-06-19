const express = require("express");
const router = express.Router();
const Category = require("../controllers/productCategoryController");
const auth = require("../middlewares/AuthMiddleware");

router.post(
  "/",
  auth.auth,
  auth.isAdmin,
  Category.createCategory
);
router.put(
  "/:id",
  auth.auth,
  auth.isAdmin,
  Category.updateCategory
);
router.delete(
  "/:id",
  auth.auth,
  auth.isAdmin,
  Category.deleteCategory
);
router.get("/:id", Category.getCategory);
router.get("/", Category.getAllCategories);

module.exports = router;