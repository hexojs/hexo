var express = require('express'),
  term = require('term'),
  path = require('path'),
  extend = require('../../extend'),
  route = require('../../route'),
  config = hexo.config;

extend.console.register('preview', 'Preview site', function(args){
  var app = express(),
    generate = require('../../generate');

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

  console.log('Loading.');

  generate({watch: true}, function(){
    var get = route.get;

    app.get(config.root + '*', function(req, res, next){
      var uri = route.format(req.params[0]),
        target = get(uri);

      if (target){
        target(function(err, result){
          if (err) throw new Error('Route Error: ' + uri);

          res.type(path.extname(uri));

          if (result.readable){
            result.pipe(res).on('error', function(err){
              res.status(500).end('500 Internal Error');
            });
          } else {
            res.end(result);
          }
        });
      } else {
        var last = uri.substr(uri.length - 1, 1);
        if (last !== '/'){
          res.redirect(uri + '/');
        } else {
          next();
        }
      }
    });

    app.use(config.root, express.static(hexo.public_dir));
    app.get('/', function(req, res){
      res.redirect(config.root);
    });
    app.use(function(req, res){
      res.status(404).end('404 Not Found');
    });

    app.listen(port, function(){
      console.log('Hexo is running at %s. Press Ctrl+C to stop.', ('http://localhost:' + port + config.root).bold);
      hexo.emit('preview');
    });
  });
});