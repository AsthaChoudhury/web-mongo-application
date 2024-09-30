export function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
    return next(); // Only call next() once
  }
  return res.status(401).json({ message: "Unauthorized. Please log in." });
}
