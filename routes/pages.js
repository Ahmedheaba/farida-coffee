const express = require("express");
const router = express.Router();

// GET /about
router.get("/about", (req, res) => {
  res.render("pages/about", { title: "About Us" });
});

// GET /our-story
router.get("/our-story", (req, res) => {
  res.render("pages/our-story", { title: "Our Story" });
});

module.exports = router;
