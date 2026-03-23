const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Helper: initialize cart in session
function getCart(req) {
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// GET /cart
router.get("/", (req, res) => {
  const cart = getCart(req);
  res.render("cart", {
    title: "Your Cart",
    cart,
    total: cartTotal(cart),
  });
});

// POST /cart/add
// POST /cart/add
// POST /cart/add
router.post("/add", async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/products");
    }

    const cart = getCart(req);
    const existing = cart.find((item) => item.productId === productId);

    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      cart.push({
        productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: Number(quantity),
      });
    }

    req.flash("success", `${product.name} added to cart!`);
    res.redirect("back");
  } catch (err) {
    next(err);
  }
});

// POST /cart/update
router.post("/update", (req, res) => {
  const { productId, quantity } = req.body;
  const cart = getCart(req);
  const item = cart.find((i) => i.productId === productId);
  if (item) {
    item.quantity = Math.max(1, Number(quantity));
  }
  res.redirect("/cart");
});

// DELETE /cart/remove
router.delete("/remove/:productId", (req, res) => {
  req.session.cart = getCart(req).filter(
    (i) => i.productId !== req.params.productId,
  );
  req.flash("success", "Item removed from cart");
  res.redirect("/cart");
});

// DELETE /cart/clear
router.delete("/clear", (req, res) => {
  req.session.cart = [];
  res.redirect("/cart");
});

// POST /cart/add-multiple — Add all wishlist items to cart
router.post("/add-multiple", async (req, res, next) => {
  try {
    let productIds = req.body["productIds[]"];
    if (!productIds) return res.redirect("/wishlist");
    if (!Array.isArray(productIds)) productIds = [productIds];

    const products = await Product.find({ _id: { $in: productIds } });
    const cart = getCart(req);

    products.forEach((product) => {
      const existing = cart.find(
        (item) => item.productId === product._id.toString(),
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          productId: product._id.toString(),
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        });
      }
    });

    req.flash("success", `${products.length} products added to cart!`);
    res.redirect("/cart");
  } catch (err) {
    next(err);
  }
});
module.exports = router;
