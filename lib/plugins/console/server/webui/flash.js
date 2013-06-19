module.exports = function(req, res, next){
  var session = req.session,
    messages = session.messages || (session.messages = {});

  req.flash = res.locals.flash = function(key, value){
    if (value === undefined){
      return messages[key];
    } else {
      messages[key] = value;
    }
  };

  next();
};