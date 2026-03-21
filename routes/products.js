const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Review = require("../models/Review");
const Order = require("../models/Order");
// GET /products - All products with filter & search
router.get("/", async (req, res, next) => {
  try {
    const { category, search, sort, min, max } = req.query;
    let query = {};

    // Search by name or description
    if (search && search.trim() !== "") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { origin: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (category) query.category = category;

    if (min || max) {
      query.price = {};
      if (min) query.price.$gte = Number(min);
      if (max) query.price.$lte = Number(max);
    }

    let sortObj = { createdAt: -1 };
    if (sort === "price-asc") sortObj = { price: 1 };
    if (sort === "price-desc") sortObj = { price: -1 };
    if (sort === "rating") sortObj = { rating: -1 };

    const products = await Product.find(query).sort(sortObj);

    res.render("products/index", {
      title: search ? `Search: "${search}"` : "Our Coffee",
      products,
      filters: req.query,
    });
  } catch (err) {
    next(err);
  }
});
// GET /products/search-suggestions — Live search API
router.get("/search-suggestions", async (req, res) => {
  try {
    const q = req.query.q || "";
    if (q.length < 2) return res.json([]);

    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { origin: { $regex: q, $options: "i" } },
      ],
    })
      .limit(5)
      .select("name category price _id");

    res.json(products);
  } catch (err) {
    res.json([]);
  }
});

// GET /products/:id - Single product
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/products");
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);

    // Load reviews for this product
    const reviews = await Review.find({ product: product._id }).sort({
      createdAt: -1,
    });

    // Check if logged in user already reviewed
    let userReview = null;
    let hasPurchased = false;
    if (req.session.userId) {
      userReview = await Review.findOne({
        product: product._id,
        user: req.session.userId,
      });
      const order = await Order.findOne({
        user: req.session.userId,
        "items.product": product._id,
        status: { $in: ["delivered", "shipped"] },
      });
      hasPurchased = !!order;
    }

    res.render("products/show", {
      title: product.name,
      product,
      related,
      reviews,
      userReview,
      hasPurchased,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
