const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { requireLogin } = require("../middleware/auth");

// POST /reviews — Submit a review
router.post("/", requireLogin, async (req, res, next) => {
  try {
    const { productId, rating, title, body } = req.body;

    // Check if user already reviewed this product
    const existing = await Review.findOne({
      product: productId,
      user: req.session.userId,
    });
    if (existing) {
      req.flash("error", "You have already reviewed this product");
      return res.redirect("/products/" + productId);
    }

    // Check if user purchased this product
    const purchased = await Order.findOne({
      user: req.session.userId,
      "items.product": productId,
      status: { $in: ["delivered", "shipped"] },
    });

    await Review.create({
      product: productId,
      user: req.session.userId,
      customerName: req.session.userName,
      rating: Number(rating),
      title,
      body,
      verified: !!purchased, // true if they bought it
    });

    // Update product average rating
    const reviews = await Review.find({ product: productId });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
    });

    req.flash("success", "Thank you for your review!");
    res.redirect("/products/" + productId);
  } catch (err) {
    if (err.code === 11000) {
      req.flash("error", "You have already reviewed this product");
      return res.redirect("/products/" + req.body.productId);
    }
    next(err);
  }
});

// DELETE /reviews/:id — Admin delete review
router.delete("/:id", async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    // Recalculate product rating
    const reviews = await Review.find({ product: review.product });
    if (reviews.length > 0) {
      const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(review.product, {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      });
    } else {
      await Product.findByIdAndUpdate(review.product, {
        rating: 0,
        reviewCount: 0,
      });
    }

    req.flash("success", "Review deleted");
    res.redirect("back");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
