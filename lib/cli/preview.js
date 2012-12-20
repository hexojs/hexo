var extend = require('../extend'),
  route = require('../route'),
  connect = require('connect'),
  clc = require('cli-color'),
  mime = require('mime'),
  url = require('url');

extend.console.register('preview', 'Preview site', function(args){
  var app = connect.createServer(),
    config = hexo.config;

  if (config.logger){
    if (config.logger_format) app.use(connect.logger(config.logger_format));
    else app.use(connect.logger());
  }

  require('../generate')({preview: true}, function(){
    var list = route.list(),
      get = route.get;

    app.use(connect.static(hexo.public_dir));

    app.use(function(req, res){
      var uri = url.parse(req.url).pathname,
        target = get(uri);

      if (target){
        target(function(err, result, source){
          if (err) throw err;

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

    app.use(connect.compress());

    app.listen(config.port, function(){
      console.log('Hexo is running at %s. Press Ctrl+C to stop.', clc.bold('http://localhost:' + config.port));
    });
  });
});