var Model = hexo.model,
  Token = Model('Token');

exports.create = function(req, res, next){
  if (req.session.token){
    var token = Token.get(req.session.token);

    if (token){
      return res.json(token);
    }
  }

  Token.insert({}, function(token){
    req.session.token = token._id;
    res.json(token);
  });
};

exports.check = function(req, res, next){
  var id = req.header('X-Auth-Token');
  if (!id) return res.send(403);

  var token = Token.get(id);
  if (!token) return res.send(403);

  next();
};

exports.destroy = function(req, res, next){
  var id = req.params.id,
    token = Token.get(id);

  if (token){
    delete req.session.token;
    Token.removeById(id);
  }

  res.status(200).json({
    code: 0
  });
};