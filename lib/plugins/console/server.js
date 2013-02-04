var connect = require('connect'),
  term = require('term'),
  async = require('async'),
  fs = require('graceful-fs'),
  extend = require('../../extend'),
  publicDir = hexo.public_dir,
  config = hexo.config;

extend.console.register('server', 'Run Server', function(args){
  var app = connect.createServer();

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
    app.use(config.root, connect.static(publicDir));
    app.use(connect.compress());
    app.use('/', function(req, res){
      res.statusCode = 302;
      res.setHeader('Location', config.root);
      res.end();
    });

    app.listen(port, function(){
      console.log('Hexo is running at %s. Press Ctrl+C to stop.', ('http://localhost:' + port + config.root).bold);
      hexo.emit('server');
    });
  });
});