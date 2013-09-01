var Model = hexo.model,
  Token = Model('Token');

exports.tokenCheck = function(req, res, next){
  var id = req.headers['x-auth-token'];
  if (!id) return res.send(403);

  var token = Token.get(id);
  if (!token) return res.send(403);

  next();
};

exports.sessionCheck = function(req, res, next){
  var id = req.session.token;
  if (!id) return res.redirect(hexo.config.root + '_/login');

  var token = Token.get(id);
  if (!token){
    delete req.session.token;
    return res.redirect(hexo.config.root + '_/login');
  }

  res.locals.auth_token = id;
  next();
};