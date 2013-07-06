module.exports = function(req, res, next){
  res.locals._csrf = req.session._csrf;
  next();
};