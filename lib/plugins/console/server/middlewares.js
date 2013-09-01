var Model = hexo.model,
  Token = Model('Token');

exports.tokenCheck = function(req, res, next){
  var id = req.headers['x-auth-token'];
  if (!id) return res.send(403);

  var token = Token.get(id);
  if (!token) return res.send(403);

  next();
};