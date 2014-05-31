var connect = require('connect'),
  http = require('http'),
  path = require('path'),
  colors = require('colors'),
  logger = require('morgan'),
  serveStatic = require('serve-static'),
  compress = require('compression'),
  mime = require('mime');

var redirect = function(res, dest){
  res.statusCode = 302;
  res.setHeader('Location', dest);
  res.end('Redirecting to ' + dest);
};

var contentType = function(res, type){
  res.setHeader('Content-Type', ~type.indexOf('/') ? type : mime.lookup(type));
};

module.exports = function(args, callback){
  var config = hexo.config,
    log = hexo.log,
    route = hexo.route;

  var app = connect(),
    serverIp = args.i || args.ip || config.server_ip || '0.0.0.0',
    port = parseInt(args.p || args.port || config.port, 10) || 4000,
    useDrafts = args.d || args.drafts || config.render_drafts || false,
    loggerFormat = args.l || args.log,
    root = config.root;

  // If the port setting is invalid, set to the default port 4000
  if (port > 65535 || port < 1){
    port = 4000;
  }

  // Drafts
  if (useDrafts) {
    hexo.extend.processor.register('_drafts/*path', require('../processor/post'));
  }

  // Logger
  if (loggerFormat){
    app.use(logger(typeof loggerFormat === 'string' ? loggerFormat : config.logger_format));
  } else if (config.logger || hexo.debug){
    app.use(logger(config.logger_format));
  }

  // Change response header
  app.use(function(req, res, next){
    res.setHeader('X-Powered-By', 'Hexo');
    next();
  });

  // Dynamic files
  if (!args.s && !args.static){
    app.use(root, function(req, res, next){
      // Ignore non-GET request
      if (req.method !== 'GET') return next();

      var url = route.format(decodeURIComponent(req.url)),
        target = route.get(url);

      // When the URL is `foo/index.html` but users access `foo`, redirect to `foo/`.
      if (!target){
        if (path.extname(url)) return next();

        redirect(res, root + url + '/');
        return;
      }

      target(function(err, result){
        if (err) return next(err);
        if (result == null) return next();

        contentType(res, path.extname(url));

        if (result.readable){
          result.pipe(res).on('error', next);
        } else {
          res.end(result);
        }
      });
    });
  }

  // Static files
  app.use(root, serveStatic(hexo.public_dir));

  // If root url is not `/`, redirect to the correct root url
  if (root !== '/'){
    app.use(function(req, res, next){
      if (req.method !== 'GET' || req.url !== '/') return next();

      redirect(res, root);
    });
  }

  // gzip
  app.use(compress());

  // Load source files
  hexo.post.load({watch: true}, function(err){
    if (err) return callback(err);

    // Start listening!
    http.createServer(app).listen(port, serverIp, function(){
      if (useDrafts){
        log.i('Using drafts.');
      }

      // for display purpose only
      var ip = serverIp === '0.0.0.0' ? 'localhost' : serverIp;

      log.i('Hexo is running at ' + 'http://%s:%d%s'.underline + '. Press Ctrl+C to stop.', ip, port, root);

      /**
      * Fired after server started.
      *
      * @event server
      * @for Hexo
      */

      hexo.emit('server');
    });
  });
};
