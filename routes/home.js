const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET / - Homepage
router.get("/", async (req, res, next) => {
  try {
    const featured = await Product.find({ featured: true }).limit(6);
    const categories = ["espresso", "filter", "cold-brew", "beans"];
    res.render("home", { title: "Farida Coffee", featured, categories });
  } catch (err) {
    next(err);
  }
});
module.exports = router;
