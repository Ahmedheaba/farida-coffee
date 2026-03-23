const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const { requireLogin } = require("../middleware/auth");

// GET /wishlist — View wishlist page
router.get("/", requireLogin, async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({
      user: req.session.userId,
    }).populate("products");
    const products = wishlist ? wishlist.products : [];
    res.render("wishlist", { title: "My Wishlist", products });
  } catch (err) {
    next(err);
  }
});

// POST /wishlist/toggle — Add or remove product
router.post("/toggle", requireLogin, async (req, res, next) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.session.userId });

    if (!wishlist) {
      // Create new wishlist and add product
      wishlist = await Wishlist.create({
        user: req.session.userId,
        products: [productId],
      });
      return res.json({ added: true, count: 1 });
    }

    const index = wishlist.products.indexOf(productId);
    if (index === -1) {
      // Add to wishlist
      wishlist.products.push(productId);
      await wishlist.save();
      return res.json({ added: true, count: wishlist.products.length });
    } else {
      // Remove from wishlist
      wishlist.products.splice(index, 1);
      await wishlist.save();
      return res.json({ added: false, count: wishlist.products.length });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /wishlist/remove/:productId
router.delete("/remove/:productId", requireLogin, async (req, res, next) => {
  try {
    await Wishlist.findOneAndUpdate(
      { user: req.session.userId },
      { $pull: { products: req.params.productId } },
    );
    req.flash("success", "Removed from wishlist");
    res.redirect("/wishlist");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
