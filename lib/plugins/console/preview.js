var express = require('express'),
  term = require('term'),
  path = require('path'),
  ejs = require('ejs'),
  extend = require('../../extend'),
  route = require('../../route'),
  config = hexo.config;

var randomPass = function(length){
  var text = '0123456789abcdefghijklmnopqrstuvwxyz',
    total = text.length,
    result = '';

  for (var i=0; i<length; i++){
    result += text.substr(parseInt(Math.random() * total), 1);
  }

  return result;
};

extend.console.register('preview', 'Preview site', function(args){
  var app = express(),
    admin = args.a || args.admin ? true : false,
    generate = require('../../generate');

  if (args.p){
    var port = args.p;
  } else if (args.port){
    var port = args.port;
  } else {
    var port = config.port;
  }

  if (config.logger){
    if (config.logger_format) app.use(express.logger(config.logger_format));
    else app.use(express.logger());
  } else if (hexo.debug){
    app.use(express.logger());
  }

  app.set('views', __dirname + '/../../../views');
  app.set('view engine', 'ejs');
  app.locals.layout = 'layout';
  app.engine('ejs', require('../../render').__express);

  if (admin){
    var adminPass = config.admin_pass || randomPass(8);

    app.use(express.bodyParser());
    app.use(express.cookieParser('nAL1o1D5wlBn96T'));
    app.use(express.session());

    app.get('/admin/auth', function(req, res, next){
      if (req.session.authed){
        next();
      } else {
        res.render('auth');
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
        next();
      } else {
        res.redirect('/admin/auth');
      }
    };

    app.get('/admin', auth, function(req, res, next){
      res.render('list');
    });
  }

  app.get(config.root + '*', function(req, res, next){
    var uri = route.format(req.params[0]),
      target = route.get(uri);

    if (target){
      target(function(err, result){
        if (err) throw new Error('Route Error: ' + uri);

        res.type(path.extname(uri));

        if (result.readable){
          result.pipe(res).on('error', function(err){
            res.status(500).end('500 Internal Error');
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

  app.use(config.root, express.static(hexo.public_dir));
  app.get('/', function(req, res){
    res.redirect(config.root);
  });
  app.use(function(req, res){
    res.status(404).end('404 Not Found');
  });

  console.log('Loading.');

  generate({watch: true}, function(){
    app.listen(port, function(){
      console.log('Hexo is running at %s. Press Ctrl+C to stop.', ('http://localhost:' + port + config.root).bold);
      if (admin) console.log('Admin password: %s', adminPass.bold);
      hexo.emit('preview');
    });
  });
});