const { sendStatusUpdateEmail } = require("../utils/mailer");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const { requireAdmin } = require("../middleware/auth");

// ─── Multer setup for product images ─────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/images/products";
    require("fs").mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
// All admin routes require admin role
router.use(requireAdmin);

// ─── Dashboard ─────────────────────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const [totalProducts, totalOrders, totalUsers, recentOrders] =
      await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        User.countDocuments(),
        Order.find().sort({ createdAt: -1 }).limit(10),
      ]);

    const revenue = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      stats: {
        products: totalProducts,
        orders: totalOrders,
        users: totalUsers,
        revenue: revenue[0]?.total || 0,
      },
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
});

// ─── Products CRUD ─────────────────────────────────────────────────────────
router.get("/products", async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render("admin/products", { title: "Manage Products", products });
  } catch (err) {
    next(err);
  }
});

router.get("/products/new", (req, res) => {
  res.render("admin/product-form", { title: "Add Product", product: null });
});

router.post(
  "/products",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  async (req, res, next) => {
    try {
      const data = req.body;
      // Main image
      if (req.files["image"]) {
        data.image = "/images/products/" + req.files["image"][0].filename;
      }
      // Additional images
      if (req.files["images"]) {
        data.images = req.files["images"].map(
          (f) => "/images/products/" + f.filename,
        );
      }
      data.featured = data.featured === "on";
      await Product.create(data);
      req.flash("success", "Product created!");
      res.redirect("/admin/products");
    } catch (err) {
      next(err);
    }
  },
);
router.get("/products/:id/edit", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    res.render("admin/product-form", { title: "Edit Product", product });
  } catch (err) {
    next(err);
  }
});

router.put(
  "/products/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  async (req, res, next) => {
    try {
      const data = req.body;
      if (req.files["image"]) {
        data.image = "/images/products/" + req.files["image"][0].filename;
      }
      if (req.files["images"] && req.files["images"].length > 0) {
        data.images = req.files["images"].map(
          (f) => "/images/products/" + f.filename,
        );
      }
      data.featured = data.featured === "on";
      await Product.findByIdAndUpdate(req.params.id, data, {
        runValidators: true,
      });
      req.flash("success", "Product updated!");
      res.redirect("/admin/products");
    } catch (err) {
      next(err);
    }
  },
);

router.delete("/products/:id", async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    req.flash("success", "Product deleted");
    res.redirect("/admin/products");
  } catch (err) {
    next(err);
  }
});

// ─── Orders Management ─────────────────────────────────────────────────────
router.get("/orders", async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.render("admin/orders", {
      title: "Manage Orders",
      orders,
      filter: status || "all",
    });
  } catch (err) {
    next(err);
  }
});

router.get("/orders/:id", async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    res.render("admin/order-detail", {
      title: `Order ${order.orderNumber}`,
      order,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/orders/:id/status", async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }, // returns the updated order
    );

    // 📧 Send email to customer
    try {
      await sendStatusUpdateEmail(order);
    } catch (emailErr) {
      console.error("Status email failed:", emailErr.message);
    }

    req.flash("success", `Order status updated & customer notified by email`);
    res.redirect("/admin/orders");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
