var async = require('async'),
  clc = require('cli-color'),
  fs = require('fs'),
  moment = require('moment'),
  rimraf = require('rimraf'),
  util = require('../util'),
  file = util.file,
  log = util.log,
  spawn = util.spawn;

var command = function(command, sub, options, callback){
  spawn(command, sub, options,
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
  var target = process.cwd(),
    deployDir = target + '/.deploy';

  async.series([
    // Load and check config
    function(next){
      require('../config')(target, function(){
        if (hexo.config.deploy) next();
        else log.error('You have to use `%s` to setup deploy.', clc.bold('hexo setup_deploy'));
      });
    },
    // Empty .deploy
    function(next){
      file.empty(deployDir, next);
    },
    // Copy public to .deploy
    function(next){
      var publicDir = hexo.public_dir;

      fs.exists(publicDir, function(exist){
        if (exist){
          file.dir(publicDir, function(files){
            async.forEach(files, function(item, next){
              var dirs = item.split('/');

              // Ignore dotfiles
              for (var i=0, len=dirs.length; i<len; i++){
                var front = dirs[i].substring(0, 1);
                if (front === '.'){
                  return next();
                }
              }
              
              file.read(publicDir + item, function(err, content){
                if (err) throw err;
                file.write(deployDir + item, content, next);
              });
              next();
            }, function(){
              log.info('Copied public to .deploy');
              next();
            });
          });
        } else {
          log.error('You have to use `%s` to generate files first.', clc.bold('hexo generate'));
        }
      });
    },
    function(next){
      command('git', ['add', '.'], {cwd: deployDir}, next);
    },
    function(next){
      command('git', ['add', '-u'], {cwd: deployDir}, next);
    },
    function(next){
      var message = 'Site updated: ' + moment().format(hexo.config.date_format + ' ' + hexo.config.time_format);
      log.info('Commiting: ' + message);
      command('git', ['commit', '-m', message], {cwd: deployDir}, next);
    },
    function(next){
      log.info('Pushing files to remote');
      command('git', ['push', 'origin', hexo.config.deploy, '--force'], {cwd: deployDir}, next);
    }
  ], function(){
    log.success('Deploy complete.');
  });
};

exports.setup = function(args){
  var repo = args[0],
    target = process.cwd(),
    deployDir = target + '/.deploy';

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
    // Create and cd .deploy folder
    function(next){
      file.mkdir(deployDir, next);
    },
    // Create placeholder file
    function(next){
      file.write(deployDir + '/.placeholder', '', next);
    },
    function(next){
      command('git', ['init'], {cwd: deployDir}, next);
    },
    function(next){
      command('git', ['add', '.'], {cwd: deployDir}, next)
    },
    function(next){
      command('git', ['commit', '-m', 'Hexo init'], {cwd: deployDir}, next);
    },
    function(next){
      if (branch == 'gh-pages') command('git', ['branch', '-m', 'gh-pages'], {cwd: deployDir}, next);
      else next();
    },
    function(next){
      command('git', ['remote', 'add', 'origin', repo], {cwd: deployDir}, next);
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