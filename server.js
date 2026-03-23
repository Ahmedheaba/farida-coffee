const translations = require("./config/translations");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("./config/passport");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const app = express();

// ─── Database Connection ───────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/farida-coffee")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ─── View Engine ───────────────────────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "farida-coffee-secret-2024",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  }),
);

// ✅ Add these two lines after session
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// ─── Language Middleware ───────────────────────────────────────────────────
app.use((req, res, next) => {
  const lang = req.session.lang || "en";
  res.locals.t = translations[lang];
  res.locals.lang = lang;

  next();
});

// ─── Global Template Variables ─────────────────────────────────────────────
app.use(async (req, res, next) => {
  try {
    // Flash messages
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");

    // User session
    res.locals.currentUser = req.session.userId || null;
    res.locals.isAdmin = req.session.isAdmin || false;
    res.locals.cartCount = req.session.cart
      ? req.session.cart.reduce((sum, item) => sum + item.quantity, 0)
      : 0;

    // Wishlist count
    if (req.session.userId) {
      const Wishlist = require("./models/Wishlist");
      const wishlist = await Wishlist.findOne({ user: req.session.userId });
      res.locals.wishlistCount = wishlist ? wishlist.products.length : 0;
    } else {
      res.locals.wishlistCount = 0;
    }

    // Store identity
    res.locals.store = {
      name: process.env.STORE_NAME || "My Store",
      tagline: process.env.STORE_TAGLINE || "Best products online",
      description:
        process.env.STORE_DESCRIPTION ||
        "Quality products delivered to your door.",
      city: process.env.STORE_CITY || "Cairo",
      country: process.env.STORE_COUNTRY || "Egypt",
      color: process.env.STORE_COLOR || "#C47E3A",
      email: process.env.STORE_EMAIL || "hello@store.com",
      phone: process.env.STORE_PHONE || "",
      whatsapp: process.env.STORE_WHATSAPP || "",
      instagram: process.env.STORE_INSTAGRAM || "#",
      facebook: process.env.STORE_FACEBOOK || "#",
      twitter: process.env.STORE_TWITTER || "#",
      currency: process.env.CURRENCY || "EGP",
      shipping: process.env.SHIPPING_COST || 50,
    };

    // Language
    const translations = require("./config/translations");
    const lang = req.session.lang || "en";
    res.locals.t = translations[lang];
    res.locals.lang = lang;

    next();
  } catch (err) {
    next(err);
  }
});
// ─── Routes ────────────────────────────────────────────────────────────────
// ─── Routes ────────────────────────────────────────────────────────────────
app.use("/", require("./routes/home"));
app.use("/products", require("./routes/products"));
app.use("/cart", require("./routes/cart"));
app.use("/checkout", require("./routes/checkout"));
app.use("/auth", require("./routes/auth"));
app.use("/admin", require("./routes/admin"));
app.use("/orders", require("./routes/orders"));
app.use("/reviews", require("./routes/reviews"));
app.use("/wishlist", require("./routes/wishlist"));

// ─── 404 Handler ─────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

// ─── Error Handler ─────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(`
    <div style="font-family:sans-serif;padding:40px;text-align:center">
      <h1>⚠️ Something went wrong</h1>
      <p style="color:#888">${err.message}</p>
      <a href="/" style="color:#C47E3A">← Back to Homepage</a>
    </div>
  `);
});

// ─── Start Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`☕ Farida Coffee running at http://localhost:${PORT}`);
});
