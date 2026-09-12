module.exports = (req, res, next) => {
  if (req.session && req.session.isAuth) {
    return next();
  }

  res.redirect("/login");
};
