var express = require('express'),
  path = require('path'),
  colors = require('colors'),
  fs = require('graceful-fs'),
  async = require('async'),
  _ = require('lodash'),
  stylus = require('stylus'),
  nib = require('nib'),
  Controller = require('./controllers');

var config = hexo.config,
  log = hexo.log,
  model = hexo.model,
  route = hexo.route,
  renderFn = hexo.render,
  render = renderFn.render,
  renderFile = renderFn.renderFile,
  publicDir = hexo.public_dir,
  processor = hexo.extend.processor;

module.exports = function(args, callback){
  var app = express(),
    port = parseInt(args.p || args.port || config.port, 10) || 4000,
    useDrafts = args.d || args.drafts || config.render_drafts || false,
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
  app.engine('ejs', renderFile);

  // App level template variables
  app.locals.layout = 'layout/app';
  app.locals.version = hexo.version;
  app.locals.config = hexo.config;
  app.locals._ = _;
  app.locals.cache = !hexo.debug;
  app.locals.root = root;
  app.locals.base = base;

  // Drafts
  if (useDrafts) {
    processor.register('_drafts/*path', require('../../processor/post'));
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

  // Enable session support
  app.use(express.cookieParser('x2gt3QrS50t0LOR'));
  app.use(express.cookieSession());

  // Routes
  require('./routes')(new Controller(app, base));

  if (hexo.debug){
    // Renders stylus files
    app.get(base + 'css/*', function(req, res, next){
      var src = path.join(hexo.core_dir, 'assets', 'styl', req.params[0].replace(/\.css$/, '.styl'));

      fs.exists(src, function(exist){
        if (!exist) return next();

        render({path: src}, function(err, result){
          if (err) return next(err);

          res.type('text/css');
          res.end(result);
        });
      });
    });
  }

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
    if (!req.accepts('html')) return next();

    res.render('error/404');
  });

  // Error handler
  app.use(function(err, req, res, next){
    log.e(err);

    if (!req.accepts('html')) return next();

    res.render('error/500', {
      err: err
    });
  });

  // gzip
  app.use(express.compress());

  // Load source files
  hexo.post.load({watch: true}, function(err){
    if (err) return callback(err);

    // Start listening!
    app.listen(port, function(){
      if (useDrafts)
        log.i('Using drafts.');

      log.i('Hexo is running at ' + 'localhost:%d%s'.underline + '. Press Ctrl+C to stop.', port, config.root);
      hexo.emit('server');
    });
  });
};
