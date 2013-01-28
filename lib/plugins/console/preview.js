var connect = require('connect'),
  term = require('term'),
  mime = require('mime'),
  url = require('url'),
  extend = require('../../extend'),
  route = require('../../route'),
  config = hexo.config;

extend.console.register('preview', 'Preview site', function(args){
  var app = connect.createServer(),
    generate = require('../../generate');

  hexo.cache.preview = true;

  if (args.p){
    var port = args.p;
  } else if (args.port){
    var port = args.port;
  } else {
    var port = config.port;
  }

  if (config.logger){
    if (config.logger_format) app.use(connect.logger(config.logger_format));
    else app.use(connect.logger());
  } else if (hexo.debug){
    app.use(connect.logger());
  }

  console.log('Loading.');

  generate({rebuild: true, watch: true}, function(){
    var list = route.list(),
      get = route.get;

    app.use(config.root, function(req, res){
      var uri = url.parse(decodeURIComponent(req.url)).pathname,
        target = get(uri);

      if (target){
        target(function(err, result, source){
          if (err) throw new Error('Route Error: ' + uri);

          res.statusCode = 200;
          res.setHeader('Content-Type', mime.lookup(source));

          if (result.readable){
            result.pipe(res).on('error', function(err){
              res.statusCode = 500;
              res.end('500 Internal Server Error');
            });
          } else {
            res.write(result);
            res.end();
          }
        });
      } else {
        var last = uri.substr(uri.length - 1, 1);
        if (last !== '/'){
          res.statusCode = 301;
          res.setHeader('Location', uri + '/');
          res.end();
        } else {
          res.statusCode = 404;
          res.end('404 Not Found');
        }
      }
    });

    app.use(config.root, connect.static(hexo.public_dir));
    app.use('/', function(req, res){
      res.statusCode = 302;
      res.setHeader('Location', config.root);
      res.end();
    });

    app.listen(port, function(){
      console.log('Hexo is running at %s. Press Ctrl+C to stop.', ('http://localhost:' + port + config.root).bold);
      hexo.emit('preview');
    });
  });
});