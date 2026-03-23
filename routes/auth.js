const express = require("express");
const router = express.Router();
const User = require("../models/User");
const passport = require("../config/passport");

// GET /auth/login
router.get("/login", (req, res) => {
  res.render("auth/login", {
    title: "Login",
    returnTo: req.query.returnTo || "/",
  });
});
// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/auth/login");
    }
    req.session.userId = user._id; // ✅ this must be here
    req.session.userName = user.name;
    req.session.isAdmin = user.role === "admin";
    req.flash("success", `Welcome back, ${user.name}!`);
    const returnTo =
      req.body.returnTo || (req.session.isAdmin ? "/admin" : "/");
    res.redirect(returnTo);
  } catch (err) {
    req.flash("error", "Something went wrong");
    res.redirect("/auth/login");
  }
});

// GET /auth/register
router.get("/register", (req, res) => {
  res.render("auth/register", {
    title: "Create Account",
    prefillEmail: req.query.email || "",
  });
});
// POST /auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, confirm } = req.body;
  if (password !== confirm) {
    req.flash("error", "Passwords do not match");
    return res.redirect("/auth/register");
  }
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      req.flash("error", "Email already registered");
      return res.redirect("/auth/register");
    }
    const user = await User.create({ name, email, password });
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.isAdmin = false;
    req.flash("success", `Welcome to Farida Coffee, ${user.name}!`);
    res.redirect("/");
  } catch (err) {
    req.flash("error", "Registration failed");
    res.redirect("/auth/register");
  }
});

// GET /auth/logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
// GET /auth/google — Redirect to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// GET /auth/google/callback — Google redirects here
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/login",
    failureFlash: true,
  }),
  async (req, res) => {
    // Save user info to session (same as normal login)
    req.session.userId = req.user._id;
    req.session.userName = req.user.name;
    req.session.isAdmin = req.user.role === "admin";
    req.flash("success", `Welcome, ${req.user.name}!`);
    res.redirect("/");
  },
);

module.exports = router;
