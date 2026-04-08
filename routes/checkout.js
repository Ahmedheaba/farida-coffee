const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const {
  sendOrderNotification,
  sendOrderConfirmationEmail,
} = require("../utils/mailer");
const SHIPPING_COST = 50; // EGP

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// GET /checkout
// GET /checkout
router.get("/", (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) {
    req.flash("error", "Your cart is empty");
    return res.redirect("/cart");
  }
  const subtotal = cartTotal(cart);
  res.render("checkout", {
    title: "Checkout",
    cart,
    subtotal,
    shipping: SHIPPING_COST,
    total: subtotal + SHIPPING_COST,
    stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
  });
});

// POST /checkout - Cash on delivery
router.post("/", async (req, res, next) => {
  try {
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.redirect("/cart");

    const { name, email, phone, street, city, zip, notes, paymentMethod } = req.body;
    const subtotal = cartTotal(cart);

    const order = await Order.create({
      user: req.session.userId || null,
      isGuest: !req.session.userId,
      customer: { name, email, phone },
      shippingAddress: { street, city, zip },
      items: cart.map((item) => ({
        product: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      subtotal,
      shippingCost: SHIPPING_COST,
      total: subtotal + SHIPPING_COST,
      paymentMethod: paymentMethod === "instapay" ? "instapay" : "cash-on-delivery",
      notes,
    });

    console.log("✅ Order created:", order.orderNumber);
    console.log("📧 Customer email:", order.customer.email);

    // ✅ Send both emails in background
    sendOrderNotification(order)
      .then(() => console.log("✅ Owner email sent"))
      .catch((err) => console.error("❌ Owner email failed:", err.message));

    sendOrderConfirmationEmail(order)
      .then(() => console.log("✅ Customer email sent"))
      .catch((err) => console.error("❌ Customer email failed:", err.message));

    req.session.cart = [];
    req.flash("success", `Order ${order.orderNumber} placed successfully!`);
    res.redirect(`/orders/${order._id}/confirmation`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
