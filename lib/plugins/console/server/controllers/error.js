exports['404'] = function(req, res, next){
  res.render('error/404', {
    layout: 'layout/error',
    title: '404',
    subtitle: 'Not found'
  });
};