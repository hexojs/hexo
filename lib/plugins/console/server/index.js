var express = require('express'),
  path = require('path'),
  async = require('async'),
  _ = require('lodash'),
  extend = require('../../../extend'),
  route = require('../../../route'),
  config = hexo.config,
  log = hexo.log,
  publicDir = hexo.public_dir;

var randomPassword = function(length){
  var txt = '0123456789abcdefghijklmnopqrstuvwxyz',
    total = txt.length,
    result = '';

  for (var i = 0; i < length; i++){
    result += txt.substr(parseInt(Math.random() * total), 1);
  }

  return result;
};

extend.console.register('server', 'Run server', {alias: 's'}, function(args){
  var app = express(),
    statics = args.s || args.static,
    logFormat = args.l || args.log,
    admin = args.a || args.admin,
    port = config.port = args.p || args.port || config.port || 4000,
    password = config.admin_password = config.admin_password || randomPassword(8);

  if (logFormat){
    app.use(express.logger(logFormat));
  } else if (config.logger){
    app.use(express.logger(config.logger_format));
  } else if (hexo.debug){
    app.use(express.logger(config.logger_format));
  }

  app.use(function(req, res, next){
    res.header('x-powered-by', 'Hexo');
    next();
  });

  if (admin){
    require('./webui')(app);
  }

  if (!statics){
    app.get(config.root + '*', function(req, res, next){
      var uri = route.format(req.params[0]),
        target = route.get(uri);

      if (!target){
        if (path.extname(uri)) return next();
        res.redirect(config.root + uri + '/');
        return;
      }

      target(function(err, result){
        if (err || !result) return next(err);

        res.type(path.extname(uri));

        if (result.readable){
          result.pipe(res).on('error', function(err){
            if (err) next(err);
          });
        } else {
          res.end(result);
        }
      });
    });
  }

  app.use(config.root, express.static(publicDir));
  if (hexo.debug) app.use(express.errorHandler());

  if (config.root !== '/'){
    app.get('/', function(req, res){
      res.redirect(config.root);
    });
  }

  log.i('Loading');

  require('../../../load')({watch: true}, function(){
    app.listen(port, function(){
      log.i('Hexo is running at localhost:%d%s. Press Ctrl+C to stop', port, config.root);
      if (admin) log.i('You can access admin panel at localhost:%d%s_/. Password: %s', port, config.root, password);
      hexo.emit('server');
    });
  });
});
