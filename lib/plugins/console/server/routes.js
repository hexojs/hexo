module.exports = function(app){
  app.get('404', 'error#404');
  app.get('500', 'error#500');

  app.namespace('api', function(api){
    api.get('/', function(req, res, next){
      res.end('alive');
    });

    api.post('token', 'token#create');
    api.del('token/:id', 'token#destroy');

    api.resources('posts', [require('./controllers/api/token').check]);
  });
};