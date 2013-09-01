exports.new = function(req, res, next){
  res.render('sessions/new', {
    layout: 'layout/plain',
    title: 'Login',
    style: 'sessions'
  });
};

exports.create = function(req, res, next){
  //
};

exports.destroy = function(req, res, next){
  //
};