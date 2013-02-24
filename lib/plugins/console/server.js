var express = require('express'),
  term = require('term'),
  async = require('async'),
  fs = require('graceful-fs'),
  extend = require('../../extend'),
  publicDir = hexo.public_dir,
  config = hexo.config;

extend.console.register('server', 'Run Server', function(args){
  var app = express();

  if (args.p){
    var port = args.p;
  } else if (args.port){
    var port = args.port;
  } else {
    var port = config.port;
  }

  if (config.logger){
    if (config.logger_format) app.use(express.logger(config.logger_format));
    else app.use(express.logger());
  } else if (hexo.debug){
    app.use(express.logger());
  }

  async.parallel([
    function(next){
      fs.exists(publicDir, function(exist){
        if (!exist || args.g || args.generate){
          hexo.call('generate', next);
        } else {
          next();
        }
      });
    }
  ], function(){
    app.use(config.root, express.static(publicDir));
    app.use(express.compress());
    app.get('/', function(req, res){
      res.redirect(config.root);
    });
    app.use(function(req, res){
      res.status(404).end('404 Not Found');
    });

    app.listen(port, function(){
      console.log('Hexo is running at %s. Press Ctrl+C to stop.', ('http://localhost:' + port + config.root).bold);
      hexo.emit('server');
    });
  });
});