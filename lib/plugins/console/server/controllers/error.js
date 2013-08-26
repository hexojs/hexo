exports['404'] = function(req, res, next){
  res.render('error/404');
};

exports['500'] = function(req, res, next){
  res.render('error/500');
};