module.exports = function(req, res, next){
  if (req.session.is_login) return next();

  res.redirect(req.app.locals.base + 'login?redirect=' + encodeURIComponent(req.url));
};