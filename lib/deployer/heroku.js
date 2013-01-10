var async = require('async'),
  colors = require('colors'),
  _ = require('underscore'),
  fs = require('graceful-fs'),
  extend = require('../extend'),
  util = require('../util'),
  file = util.file,
  spawn = util.spawn;

var displayHelp = function(){
  var help = [
    '',
    'You should configure deployment settings in ' + '_config.yml'.bold + ' first!',
    '',
    'Example:',
    '  deploy:',
    '    type: heroku',
    '    repository: <repository>',
    '',
    'More info: http://zespia.tw/hexo/docs/deploy.html',
  ];

  console.log(help.join('\n') + '\n');
};

var command = function(comm, args, callback){
  spawn({
    command: comm,
    args: args,
    exit: function(code){
      if (code === 0) callback();
    }
  });
};

var deploy = function(){
  var config = hexo.config.deploy;

  if (!config.repository) return displayHelp();

  async.series([
    // Check if public exists or not
    function(next){
      fs.exists(hexo.public_dir, function(exist){
        if (exist) next();
        else console.log('You have to use %s to generate files first.', 'hexo generate'.bold);
      });
    },
    function(next){
      command('git', ['add', '-A'], next);
    },
    function(next){
      var message = 'Site updated: ' + new Date();
      command('git', ['commit', '-m', message], next);
    },
    function(next){
      command('git', ['push', 'heroku', 'master', '--force'], next);
    }
  ], function(){
    console.log('Deploy complete.');
  });
};

var setup = function(){
  var config = hexo.config.deploy,
    baseDir = hexo.base_dir,
    pkgfile = baseDir + 'package.json';

  if (!config.repository) return displayHelp();

  async.waterfall([
    // Read package.json
    function(next){
      file.read(pkgfile, next);
    },
    // Edit package.json
    function(pkg, next){
      var pkg = JSON.parse(pkg);

      if (_.isObject(pkg.dependencies)){
        pkg.dependencies = _.extend(pkg.dependencies, {connect: '*'});
      } else {
        pkg.dependencies = {connect: '*'};
      }

      file.write(pkgfile, JSON.stringify(pkg, null, '  ') + '\n', next);
    },
    // Create Procfile
    function(next){
      file.write(baseDir + 'Procfile', 'web: node app', next);
    },
    // Create app.js
    function(next){
      var app = [
        'var connect = require("connect"),',
        '  app = connect.createServer(),',
        '  port = process.env.PORT;',
        '',
        'app.use(connect.static(__dirname + "/public"));',
        'app.use(connect.compress());',
        '',
        'app.listen(port, function(){',
        '  console.log("Hexo is running on port %d.", port);',
        '});'
      ];

      file.write(baseDir + 'app.js', app.join('\n'), next);
    },
    function(next){
      command('git', ['init'], next);
    },
    function(next){
      spawn({
        command: 'git',
        args: ['remote', 'add', 'heroku', config.repository],
        exit: function(code){
          if (code === 0){
            next();
          } else {
            command('git', ['remote', 'set-url', 'heroku', config.repository], next);
          }
        }
      });
    }
  ], function(err){
    if (err) throw err;
    else console.log('Now you can deploy to %s with %s.', config.repository, 'hexo deploy'.bold);
  });
};

extend.deployer.register('heroku', {
  deploy: deploy,
  setup: setup
});