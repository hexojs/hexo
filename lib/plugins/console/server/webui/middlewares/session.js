module.exports = function(req, res, next){
  if (hexo.debug || req.session.is_login) return next();

  var base = req.app.locals.base,
    redirect = req.url.substring(base.length);

  res.redirect(base + 'login' + (redirect ? '?redirect=' + encodeURIComponent(redirect) : ''));
};