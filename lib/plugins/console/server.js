var express = require('express'),
  term = require('term'),
  path = require('path'),
  async = require('async'),
  fs = require('graceful-fs'),
  _ = require('lodash'),
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
    //admin = args.a || args.admin ? true : false,
    admin = false,
    statics = args.s || args.static ? true : false,
    log = args.l || args.log,
    port = args.p || args.port || config.port,
    generate = require('../../generate');

  app.set('views', hexo.core_dir + 'views');
  app.set('view engine', 'ejs');
  app.locals.config = config;
  app.locals.version = hexo.version;
  //app.locals.layout = 'layout';
  //app.locals.cache = true;
  app.engine('ejs', require('../../render').renderFile);

  app.resource = function(){
    var args = _.toArray(arguments),
      path = args.shift(),
      obj = args.pop();

    if (obj.index) app.get.apply(app, [].concat(path, args, obj.index));
    if (obj.new) app.get.apply(app, [].concat(path + '/new', args, obj.new));
    if (obj.create) app.post.apply(app, [].concat(path, args, obj.create));
    if (obj.show) app.get.apply(app, [].concat(path + '/:id', args, obj.show));
    if (obj.edit) app.get.apply(app, [].concat(path + '/:id/edit', args, obj.edit));
    if (obj.update) app.put.apply(app, [].concat(path + '/:id', args, obj.update));
    if (obj.destroy) app.del.apply(app, [].concat(path + '/:id', args, obj.destroy));

    return this;
  };

  if (log){
    app.use(express.logger(log));
  } else if (config.logger){
    if (config.logger_format) app.use(express.logger(config.logger_format));
    else app.use(express.logger());
  } else if (hexo.debug){
    app.use(express.logger());
  }

  var startServer = function(){
    app.use(config.root, express.static(publicDir));

    if (config.root !== '/'){
      app.get('/', function(req, res){
        res.redirect(config.root);
      });
    }

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
          next(null, !exist);
        });
      },
      function(generate, next){
        if (!generate) return next();
        hexo.call('generate', next);
      }
    ], startServer);

    return;
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
      if (req.session.authed) return next();
      res.redirect('/admin/auth');
    };

    app.get('/admin', auth, function(req, res, next){
      res.render('list');
    });

    app.use('/admin', express.static(hexo.core_dir + 'public'));
  }

  app.get(config.root + '*', function(req, res, next){
    var uri = route.format(req.params[0]),
      target = route.get(uri);

    if (!target){
      if (uri.substr(uri.length - 1, 1) === '/') return next();
      res.redirect(req.url + '/');
      return;
    }

    target(function(err, result){
      if (err) throw err;

      res.type(path.extname(uri));

      if (result.readable){
        result.pipe(res).on('error', function(err){
          if (err) next();
        });
      } else {
        res.end(result);
      }
    });
  });

  console.log('Loading.');
  generate({watch: true}, startServer);
});