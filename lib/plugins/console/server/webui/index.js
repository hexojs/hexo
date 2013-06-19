var express = require('express'),
  stylus = require('stylus'),
  Controller = require('./controller'),
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
  app.engine('ejs', hexo.render.renderFile);

  app.use(express.cookieParser());
  app.use(express.session({secret: 'x2gt3QrS50t0LOR'}));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.csrf());
  app.use(base, stylus.middleware({
    src: hexo.core_dir + 'assets/server',
    dest: hexo.core_dir + 'public',
    compile: function(str, path, fn){
      stylus(str)
        .set('filename', path)
        .set('compress', true)
        .render(fn);
    }
  }));

  require('./route')(new Controller(app, base));
};