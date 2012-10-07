var async = require('async'),
  clc = require('cli-color'),
  fs = require('fs'),
  moment = require('moment'),
  rimraf = require('rimraf'),
  util = require('../util'),
  file = util.file,
  log = util.log,
  spawn = util.spawn;

var command = function(command, sub, callback){
  spawn(command, sub,
    function(data){
      log.info(data);
    },
    function(data){
      log.error(data);
    },
    function(code){
      if (code == 0) callback();
      else log.error(code);
    }
  );
};

exports.deploy = function(){
  var target = process.cwd();

  async.series([
    function(next){
      require('../config')(target, function(){
        if (hexo.config.deploy) next();
        else log.error('You have to use `%s` to setup deploy.', clc.bold('hexo setup_deploy'));
      });
    },
    function(next){
      var publicDir = hexo.public_dir;

      fs.exists(publicDir, function(exist){
        if (exist){
          log.info('Copying public to deploy.');
          file.dir(publicDir, function(files){
            async.forEach(files, function(item, next){
              file.copy(publicDir + item, target + '/.deploy/' + item);
              next();
            }, next);
          });
        } else {
          log.error('You have to use `%s` to generate files first.', clc.bold('hexo generate'));
        }
      });
    },
    function(next){
      command('cd', [target + '/.deploy'], next);
    },
    function(next){
      command('git', ['add', '.'], next);
    },
    function(next){
      command('git', ['add', '-u'], next);
    },
    function(next){
      var message = 'Site updated: ' + moment().format(hexo.config.date_format + ' ' + hexo.config.time_format);
      log.info('Commiting: ' + message);
      command('git', ['commit', '-m', message], next);
    },
    function(next){
      log.info('Pushing files to remote');
      command('git', ['push', 'origin', hexo.config.deploy, '--force'], next);
    },
    function(next){
      rimraf(target + '/.deploy', function(){
        log.info('.deploy deleted.');
        next(null);
      });
    }
  ], function(){
    log.success('Deploy complete.');
  });
};

exports.setup = function(args){
  var repo = args[0];

  if (repo === undefined) return false;

  if (args[1]){
    var branch = args[1];
  } else {
    if (repo.match(/^(https?:\/\/|git(@|:\/\/))([^\/]+)/)[3].match(/github\.com/)){
      var branch = repo.match(/\/\w+\.github\.com/) ? 'master' : 'gh-pages';
    } else {
      var branch = 'master';
    }
  }

  async.series([
    function(next){
      command('git', ['init'], next);
    },
    function(next){
      command('git', ['add', '.'], next);
    },
    function(next){
      command('git', ['commit', '-m', 'init'], next);
    },
    function(next){
      if (branch == 'gh-pages') command('git', ['branch', '-m', 'gh-pages'], next);
      else next();
    },
    function(next){
      command('git', ['remote', 'add', 'origin', repo], next);
    },
    function(next){
      var configFile = process.cwd() + '/_config.yml',
        regex = /deploy:\s*[^\n]+/;

      file.read(configFile, function(err, content){
        if (err) throw err;

        if (content.match(regex)){
          var newContent = content.replace(regex, 'deploy: ' + branch);
        } else {
          var newContent = content + '\n\n' +
            '# Deploy\n' +
            'deploy: ' + branch;
        }

        file.write(configFile, newContent, next);
      });
    }
  ], function(){
    log.success('Now you can deploy to ' + repo + ' with `%s`.', clc.bold('hexo deploy'));
  });
};