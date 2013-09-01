var middlewares = require('./middlewares');

module.exports = function(app){
  var base = app.app.locals.base;

  var sessionCheck = function(req, res, next){
    var id = req.session.token;
    if (!id) return res.redirect(base + 'login');

    var token = Token.get(id);
    if (!token){
      delete req.session.token;
      return res.redirect(base + 'login');
    }

    res.locals.auth_token = id;
    next();
  };

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

  app.get('/', [sessionCheck], function(req, res, next){
    res.end('index');
  });

  app.get('login', 'sessions#new');
  app.post('login', 'sessions#create');
  app.get('logout', 'sessions#destroy');
  app.del('logout', 'sessions#destroy');

  app.resources('posts', [sessionCheck]);
};