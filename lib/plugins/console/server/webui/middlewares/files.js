module.exports = function(req, res, next){
  if (req.params[0].substring(0, 1) === '.') return res.send(400);

  next();
};