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

    const { name, email, phone, street, city, zip, notes } = req.body;
    const subtotal = cartTotal(cart);

    const order = await Order.create({
      user: req.session.userId || null, // null for guests
      isGuest: !req.session.userId, // flag guest orders
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
      paymentMethod: "cash-on-delivery",
      notes,
    });

    // Send emails in background
    sendOrderNotification(order).catch((err) =>
      console.error("Owner email failed:", err.message),
    );
    sendOrderConfirmationEmail(order).catch((err) =>
      console.error("Customer email failed:", err.message),
    );

    req.session.cart = [];

    // Send owner notification
    // Send in background — don't wait for it
    sendOrderNotification(order).catch((err) =>
      console.error("Email failed:", err.message),
    );
    req.session.cart = [];
    req.flash("success", `Order ${order.orderNumber} placed successfully!`);
    res.redirect(`/orders/${order._id}/confirmation`);
  } catch (err) {
    next(err);
  }
});
// POST /checkout/stripe - Create Stripe payment intent
router.post("/stripe/intent", async (req, res) => {
  try {
    const cart = req.session.cart || [];
    const subtotal = cartTotal(cart);
    const total = subtotal + SHIPPING_COST;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100, // Stripe uses smallest currency unit
      currency: "egp",
      metadata: { integration_check: "accept_a_payment" },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /checkout/stripe/confirm
router.post("/stripe/confirm", async (req, res, next) => {
  try {
    const { paymentIntentId, name, email, phone, street, city, zip } = req.body;
    const cart = req.session.cart || [];
    const subtotal = cartTotal(cart);

    const order = await Order.create({
      user: req.session.userId,
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
      paymentMethod: "stripe",
      paymentStatus: "paid",
      stripePaymentId: paymentIntentId,
      status: "confirmed",
    });

    req.session.cart = [];
    res.json({ success: true, orderId: order._id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
