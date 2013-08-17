var express = require('express'),
  path = require('path'),
  colors = require('colors'),
  async = require('async');

var config = hexo.config,
  log = hexo.log,
  route = hexo.route,
  publicDir = hexo.public_dir;

module.exports = function(args, callback){
  var app = express(),
    port = parseInt(args.p || args.port || config.port, 10),
    loggerFormat = args.l || args.log;

  // If the port setting is invalid, set to the default port 4000
  if (args.port > 65535 || args.port < 1){
    port = 4000;
  }

  // Logger
  if (loggerFormat){
    app.use(express.logger(typeof loggerFormat === 'string' ? loggerFormat : config.logger_format));
  } else if (config.logger || hexo.debug){
    app.use(express.logger(config.logger_format));
  }

  // Change response header
  app.use(function(req, res, next){
    res.header('x-powered-by', 'Hexo');
    next();
  });

  // Dynamic files
  if (!args.s && !args.static){
    app.get(config.root + '*', function(req, res, next){
      var url = route.format(req.params[0]),
        target = route.get(url);

      // When the URL is `foo/index.html` but users access `foo`, redirect to `foo/`.
      if (!target){
        if (path.extname(url)) return next();

        res.redirect(config.root + url + '/');
        return;
      }

      target(function(err, result){
        if (err) return next(err);

        res.type(path.extname(url));

        if (result.readable){
          result.pipe(res).on('error', next);
        } else {
          res.end(result);
        }
      });
    });
  }

  // Static files
  app.use(config.root, express.static(publicDir));

  // If root url is not `/`, redirect to the correct root url
  if (config.root !== '/'){
    app.get('/', function(req, res){
      res.redirect(config.root);
    });
  }

  // Error handler
  app.use(function(err, req, res, next){
    log.e(err);
  });

  // Load source files
  require('../../../load')({watch: true}, function(){
    // Start listening!
    app.listen(port, function(){
      log.i('Hexo is running at ' + 'localhost:%d%s'.underline + '. Press Ctrl+C to stop.', port, config.root);
      hexo.emit('server');
    });
  });
};