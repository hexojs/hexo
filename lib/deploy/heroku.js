var async = require('async'),
  clc = require('cli-color'),
  _ = require('underscore'),
  extend = require('../extend'),
  util = require('../util'),
  file = util.file,
  spawn = util.spawn;

var deploy = function(){
  var config = hexo.config.deploy;

  var command = function(comm, args, callback){
    spawn({
      command: comm,
      args: args,
      exit: function(code){
        if (code === 0) callback();
        else console.log(code);
      }
    });
  };

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
    baseDir = hexo.base_dir,
    pkgfile = baseDir + 'package.json';

  var command = function(comm, args, callback){
    spawn({
      command: comm,
      args: args,
      exit: function(code){
        if (code === 0) callback();
        else console.log(code);
      }
    });
  };

  async.series([
    // Read package.json
    function(next){
      file.read(pkgfile, next);
    },
    // Add dependencies to package.json
    function(next, file){
      var pkg = JSON.parse(file);

      if (_.isObject(pkg.dependencies)){
        pkg.dependencies = _.extend(pkg.dependencies, {hexo: '*'});
      } else {
        pkg.dependencies = {
          hexo: '*'
        };
      }

      file.write(pkgfile, JSON.stringify(pkg, null, '  ') + '\n', next);
    },
    // Create Procfile
    function(next){
      file.write(baseDir + 'Procfile', 'web: node_modules/hexo/bin/hexo server', next);
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