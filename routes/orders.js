const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { requireLogin } = require("../middleware/auth");

// GET /orders — My Orders page
router.get("/", requireLogin, async (req, res, next) => {
  try {
    console.log("Session userId:", req.session.userId);

    const orders = await Order.find({ user: req.session.userId }).sort({
      createdAt: -1,
    });

    console.log("Orders found:", orders.length);

    const allOrders = await Order.find({});
    console.log("All orders in DB:", allOrders.length);
    allOrders.forEach((o) => console.log(o.orderNumber, "→ user:", o.user));

    res.render("orders/index", { title: "My Orders", orders });
  } catch (err) {
    next(err);
  }
});

// GET /orders/:id/tracking — Order tracking page
router.get("/:id/tracking", requireLogin, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.session.userId,
    });
    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/orders");
    }
    res.render("orders/tracking", {
      title: `Order ${order.orderNumber}`,
      order,
    });
  } catch (err) {
    next(err);
  }
});

// GET /orders/:id/confirmation — after placing order
router.get("/:id/confirmation", async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.redirect("/");
    res.render("orders/confirmation", { title: "Order Confirmed!", order });
  } catch (err) {
    next(err);
  }
});

// GET /orders/track — Guest order tracking page
router.get("/track", (req, res) => {
  res.render("orders/track", {
    title: "Track Your Order",
    order: null,
    error: null,
  });
});

// POST /orders/track — Look up guest order
router.post("/track", async (req, res, next) => {
  try {
    const { email, orderNumber } = req.body;

    const order = await Order.findOne({
      orderNumber: orderNumber.trim().toUpperCase(),
      "customer.email": email.trim().toLowerCase(),
    });

    if (!order) {
      return res.render("orders/track", {
        title: "Track Your Order",
        order: null,
        error:
          "No order found with that email and order number. Please check and try again.",
      });
    }

    res.render("orders/tracking", {
      title: `Order ${order.orderNumber}`,
      order,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
