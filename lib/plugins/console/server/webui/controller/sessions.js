var config = hexo.config;

exports.new = function(req, res, next){
  res.render('session/new');
};

exports.create = function(req, res, next){
  if (req.body.password === config.admin_password){
    req.session.is_login = true;

    var base = req.app.locals.base;

    if (req.query.redirect){
      res.redirect(base + decodeURIComponent(req.query.redirect));
    } else {
      res.redirect(base);
    }
  } else {
    res.redirect(req.url);
  }
};

exports.destroy = function(req, res, next){
  delete req.session.is_login;

  res.redirect(req.app.locals.base);
  next();
};