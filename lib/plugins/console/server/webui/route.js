var middleware = require('./middleware');

module.exports = function(app){
  app.get('login', 'session#new');
  app.post('login', 'session#create');
  app.del('logout', 'session#destroy');

  app.namespace('/', middleware.session, function(app){
    app.get('/', 'home#index');
  });
};