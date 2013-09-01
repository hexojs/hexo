var middlewares = require('./middlewares');

module.exports = function(app){
  app.get('404', 'error#404');
  app.get('500', 'error#500');

  app.namespace('api', function(api){
    api.get('/', function(req, res, next){
      res.end('alive');
    });

    api.post('token', 'token#create');
    api.del('token/:id', 'token#destroy');

    api.resources('posts', [middlewares.tokenCheck], {
      only: ['index', 'create', 'show', 'update', 'destroy']
    });

    api.post('posts/preview', [middlewares.tokenCheck], 'posts#preview');
  });

  app.get('/', [middlewares.sessionCheck], 'app#index');

  app.get('login', 'sessions#new');
  app.post('login', 'sessions#create');
  app.get('logout', 'sessions#destroy');
  app.del('logout', 'sessions#destroy');
};