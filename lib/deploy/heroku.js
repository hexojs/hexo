var async = require('async'),
  clc = require('cli-color'),
  _ = require('underscore'),
  extend = require('../extend'),
  util = require('../util'),
  file = util.file,
  spawn = util.spawn;

var command = function(comm, args, callback){
  spawn({
    command: comm,
    args: args,
    exit: function(code){
      if (code === 0) callback();
    }
  });
}

var deploy = function(){
  var config = hexo.config.deploy;

  async.series([
    function(next){
      command('git', ['add', '.'], next);
    },
    function(next){
      var message = 'Site updated: ' + new Date();
      command('git', ['commit', '-m', message], next);
    },
    function(next){
      command('git', ['push', 'heroku', '--force'], next);
    }
  ], function(){
    console.log('Deploy complete.');
  });
};

var setup = function(){
  var config = hexo.config.deploy,
    baseDir = hexo.base_dir;

  async.series([
    // Read package.json
    function(next){
      file.read(baseDir + 'package.json', next);
    },
    // Edit package.json
    function(next, file){
      var pkg = JSON.parse(file);

      if (_.isObject(pkg.dependencies)){
        pkg.dependencies = _.extend(pkg.dependencies, {connect: '*'});
      } else {
        pkg.dependencies = {connect: '*'};
      }

      file.write(pkgfile, JSON.stringify(pkg, null, '  ') + '\n', next);
    },
    // Create Procfile
    function(next){
      file.write(baseDir + 'Procfile', 'web: app.js', next);
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
      command('git', ['add', '.'], next);
    },
    function(next){
      command('git', ['commit', '-m', 'First commit'], next);
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
    else console.log('Now you can deploy to %s with %s.', config.repository, clc.bold('hexo deploy'));
  });
};

extend.deploy.register('heroku', {
  deploy: deploy,
  setup: setup
});