var express = require('express'),
  _ = require('lodash'),
  Controller = require('./controllers'),
  config = hexo.config,
  model = hexo.model;

module.exports = function(app){
  var base = config.root + '_/';

  app.set('views', hexo.core_dir + 'views');
  app.set('view engine', 'ejs');
  app.locals.base = base;
  app.locals.config = config;
  app.locals.version = hexo.version;
  app.locals.site = model;
  app.locals.layout = 'layout';
  app.locals.cache = !hexo.debug;
  app.locals._ = _;
  app.engine('ejs', hexo.render.renderFile);

  app.use(express.cookieParser('x2gt3QrS50t0LOR'));
  app.use(express.cookieSession());
  app.use(express.csrf({
    value: function(req){
      var token = (req.body && req.body._csrf) ||
        (req.query && req.query._csrf) ||
        (req.headers['x-csrf-token']) ||
        (req.headers['x-xsrf-token']);

      return token;
    }
  }));
  app.use(function(req, res, next){
    res.cookie('XSRF-TOKEN', req.session._csrf);
    next();
  });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('./middlewares').csrf);
  app.use(base, express.static(hexo.core_dir + 'public'));

  require('./route')(new Controller(app, base));
};