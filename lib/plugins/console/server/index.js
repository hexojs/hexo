var express = require('express'),
  path = require('path'),
  colors = require('colors'),
  async = require('async'),
  _ = require('lodash'),
  Controller = require('./controllers');

var config = hexo.config,
  log = hexo.log,
  model = hexo.model,
  route = hexo.route,
  publicDir = hexo.public_dir;

module.exports = function(args, callback){
  var app = express(),
    port = parseInt(args.p || args.port || config.port, 10),
    loggerFormat = args.l || args.log,
    root = config.root,
    base = root + '_/';

  // If the port setting is invalid, set to the default port 4000
  if (args.port > 65535 || args.port < 1){
    port = 4000;
  }

  // View engine settings
  app.set('views', path.join(hexo.core_dir, 'views'));
  app.set('view engine', 'ejs');
  app.engine('ejs', hexo.render.renderFile);

  // App level template variables
  app.locals.layout = 'layout/app';
  app.locals.version = hexo.version;
  app.locals.config = hexo.config;
  app.locals._ = _;
  app.locals.cache = !hexo.debug;
  app.locals.root = root;
  app.locals.base = base;

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

  // Enable session support
  app.use(express.cookieParser('x2gt3QrS50t0LOR'));
  app.use(express.cookieSession());

  // Enable body parsing
  app.use(express.bodyParser());

  // Enable method override
  app.use(express.methodOverride());

  // Routes
  require('./routes')(new Controller(app, base));
  app.use(base, express.static(path.join(hexo.core_dir, 'public')));

  // Dynamic files
  if (!args.s && !args.static){
    app.get(root + '*', function(req, res, next){
      var url = route.format(req.params[0]),
        target = route.get(url);

      // When the URL is `foo/index.html` but users access `foo`, redirect to `foo/`.
      if (!target){
        if (path.extname(url)) return next();

        res.redirect(root + url + '/');
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
  app.use(root, express.static(publicDir));

  // If root url is not `/`, redirect to the correct root url
  if (root !== '/'){
    app.get('/', function(req, res){
      res.redirect(root);
    });
  }

  // 404
  app.use(function(req, res, next){
    if (req.method !== 'GET') return next();

    res.redirect(base + 404);
  });

  // Error handler
  app.use(function(err, req, res, next){
    log.e(err);

    res.render('error/500', {
      layout: 'layout/error',
      title: '500',
      subtitle: 'Internal server Error',
      err: err
    });
  });

  // gzip
  app.use(express.compress());

  // Load source files
  hexo.post.load({watch: true}, function(){
    // Start listening!
    app.listen(port, function(){
      log.i('Hexo is running at ' + 'localhost:%d%s'.underline + '. Press Ctrl+C to stop.', port, config.root);
      hexo.emit('server');
    });
  });
};