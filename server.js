require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
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
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
  }),
);

app.use(flash());

// ─── Global Template Variables ─────────────────────────────────────────────
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.session.userId || null;
  res.locals.isAdmin = req.session.isAdmin || false;
  // Cart item count for navbar badge
  res.locals.cartCount = req.session.cart
    ? req.session.cart.reduce((sum, item) => sum + item.quantity, 0)
    : 0;
  next();
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
