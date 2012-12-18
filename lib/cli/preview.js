var extend = require('../extend'),
  route = require('../route'),
  connect = require('connect'),
  clc = require('cli-color');

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
      var url = req.url,
        target = get(url);

      if (target){
        target(function(err, result){
          if (err) throw err;

          if (result.readable){
            result.pipe(res).on('error', function(err){
              res.writeHead(500);
              res.end('500 Internal Server Error');
            });
          } else {
            res.end(result);
          }
        });
      } else {
        var last = url.substr(url.length - 1, 1);
        if (last !== '/'){
          res.statusCode = 301;
          res.setHeader('Location', url + '/');
          res.end('Redirecting to ' + url + '/');
        } else {
          res.writeHead(404);
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