var express = require('express'),
  path = require('path'),
  colors = require('colors');

module.exports = function(args, callback){
  var config = hexo.config,
    log = hexo.log,
    route = hexo.route,
    processor = hexo.extend.processor;

  var app = express(),
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
  app.use(root, express.static(hexo.public_dir));

  // If root url is not `/`, redirect to the correct root url
  if (root !== '/'){
    app.get('/', function(req, res){
      res.redirect(root);
    });
  }

  // gzip
  app.use(express.compress());

  // Load source files
  hexo.post.load({watch: true}, function(err){
    if (err) return callback(err);

    // Start listening!
    app.listen(port, function(){
      if (useDrafts)
        log.i('Using drafts.');

      log.i('Hexo is running at ' + 'localhost:%d%s'.underline + '. Press Ctrl+C to stop.', port, root);

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