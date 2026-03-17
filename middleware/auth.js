// Require logged-in user
exports.requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Please log in to continue');
    return res.redirect('/auth/login');
  }
  next();
};

// Require admin role
exports.requireAdmin = (req, res, next) => {
  if (!req.session.isAdmin) {
    req.flash('error', 'Access denied');
    return res.redirect('/');
  }
  next();
};
