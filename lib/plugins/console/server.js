var express = require('express'),
  term = require('term'),
  path = require('path'),
  async = require('async'),
  fs = require('graceful-fs'),
  extend = require('../../extend'),
  route = require('../../route'),
  config = hexo.config,
  publicDir = hexo.public_dir;

var randomPass = function(length){
  var text = '0123456789abcdefghijklmnopqrstuvwxyz',
    total = text.length,
    result = '';

  for (var i=0; i<length; i++){
    result += text.substr(parseInt(Math.random() * total), 1);
  }

  return result;
};

extend.console.register('server', 'Run server', function(args){
  var app = express(),
    admin = args.a || args.admin ? true : false,
    statics = args.s || args.static ? true : false,
    port = args.p || args.port || config.port,
    generate = require('../../generate');

  app.set('views', hexo.core_dir + 'views');
  app.set('view engine', 'ejs');
  app.locals.config = config;
  app.locals.version = hexo.version;
  //app.locals.layout = 'layout';
  //app.locals.cache = true;
  app.engine('ejs', require('../../render').renderFile);

  if (config.logger){
    if (config.logger_format) app.use(express.logger(config.logger_format));
    else app.use(express.logger());
  } else if (hexo.debug){
    app.use(express.logger());
  }

  var startServer = function(){
    app.use(config.root, express.static(publicDir));

    app.get('/', function(req, res){
      res.redirect(config.root);
    });

    app.use(function(req, res){
      res.status(404).end('404 Not Found');
    });

    app.listen(port, function(){
      console.log('Hexo is running at %s. Press Ctrl+C to stop.', ('http://localhost:' + port + config.root).bold);
      if (admin && !statics) console.log('Admin password: %s', adminPass.bold);
      hexo.emit('server');
    });
  };

  if (statics){
    app.use(express.compress());

    async.waterfall([
      function(next){
        if (args.g || args.generate) return next(null, true);
        fs.exists(publicDir, function(exist){
          next(null, exist);
        });
      },
      function(generate, next){
        if (!generate) return next();
        hexo.call('generate', next);
      }
    ], startServer);
  }

  if (admin){
    var adminPass = config.admin_pass || randomPass(8);

    app.use(express.bodyParser());
    app.use(express.cookieParser('nAL1o1D5wlBn96T'));
    app.use(express.session());

    app.get('/admin/auth', function(req, res, next){
      if (req.session.authed){
        next();
      } else {
        res.render('auth', {error: req.query.error});
      }
    });

    app.post('/admin/auth', function(req, res, next){
      var pass = req.body.pass;
      if (pass === adminPass){
        req.session.authed = true;
        res.redirect('/admin');
      } else {
        res.redirect('/admin/auth?error=1');
      }
    });

    var auth = function(req, res, next){
      if (req.session.authed){
        res.redirect('/admin');
      } else {
        res.redirect('/admin/auth');
      }
    };

    app.get('/admin', auth, function(req, res, next){
      res.render('list');
    });

    app.use('/admin', express.static(hexo.core_dir + 'public'));
  }

  app.use(config.root, function(req, res, next){
    var uri = route.format(req.path),
      target = route.get(uri);

    if (target){
      target(function(err, result){
        if (err) throw new Error('Route Error: ' + uri);

        res.type(path.extname(uri));

        if (result.readable){
          result.pipe(res).on('error', function(err){
            if (err) res.status(500).end('500 Internal Error');
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

  console.log('Loading.');
  generate({watch: true}, startServer);
});