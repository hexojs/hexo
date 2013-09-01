var Model = hexo.model,
  Token = Model('Token');

exports.new = function(req, res, next){
  res.render('sessions/new', {
    invalid: false
  });
};

exports.create = function(req, res, next){
  if (req.body.password !== hexo.config.admin_password){
    return res.render('sessions/new', {
      invalid: true
    });
  }

  Token.insert({}, function(token){
    req.session.token = token._id;
    res.redirect(hexo.config.root + '_/');
  });
};

exports.destroy = function(req, res, next){
  var id = req.session.token;

  if (id){
    delete req.session.token;
    Token.removeById(id);
  }

  res.redirect(hexo.config.root + '_/');
};