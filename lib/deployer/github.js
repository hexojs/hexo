var fs = require('fs'),
  clc = require('cli-color'),
  path = require('path'),
  async = require('async'),
  extend = require('../extend'),
  util = require('../util'),
  file = util.file,
  spawn = util.spawn;

var displayHelp = function(){
  var help = [
    '',
    'You should configure deployment settings in ' + clc.bold('_config.yml') + ' first!',
    '',
    'Example:',
    '  deploy:',
    '    type: github',
    '    repository: <repository>',
    '    branch: <branch>',
    '',
    'More info: http://zespia.tw/hexo/docs/deploy.html',
  ];

  console.log(help.join('\n') + '\n');
};

var deploy = function(){
  var config = hexo.config.deploy,
    deployDir = hexo.base_dir + '.deploy/',
    publicDir = hexo.public_dir;

  if (!config.repository || !config.branch) return displayHelp();

  var command = function(comm, args, callback){
    spawn({
      command: comm,
      args: args,
      options: {cwd: deployDir},
      exit: function(code){
        if (code === 0) callback();
      }
    });
  };

  async.series([
    // Check if .deploy exists
    function(next){
      fs.exists(deployDir, function(exist){
        if (exist) next();
        else console.log('You have to use %s to setup deployment.', clc.bold('hexo setup_deploy'));
      });
    },
    // Empty .deploy
    function(next){
      console.log('Clearing.');
      file.empty(deployDir, next);
    },
    // Copy public to .deploy
    function(next){
      console.log('Copying files.');
      fs.exists(publicDir, function(exist){
        if (exist){
          file.dir(publicDir, function(files){
            async.forEach(files, function(item, next){
              var dirs = item.split(path.sep);

              for (var i=0, len=dirs.length; i<len; i++){
                if (dirs[i].substring(0, 1) === '.'){
                  continue;
                }
              }

              file.copy(publicDir + item, deployDir + item, next);
            }, next);
          });
        } else {
          console.log('You should use %s to generate files first.', clc.bold('hexo generate'));
        }
      });
    },
    function(next){
      command('git', ['add', '.'], next);
    },
    function(next){
      var message = 'Site updated: ' + new Date();
      command('git', ['commit', '-m', message], next);
    },
    function(next){
      command('git', ['push', 'github', config.branch, '--force'], next);
    }
  ], function(){
    console.log('Deploy complete.');
  });
};

var setup = function(){
  var config = hexo.config.deploy,
    deployDir = hexo.base_dir + '.deploy/';

  if (!config.repository || !config.branch) return displayHelp();

  var command = function(comm, args, callback){
    spawn({
      command: comm,
      args: args,
      options: {cwd: deployDir},
      exit: function(code){
        if (code === 0) callback();
      }
    });
  };

  async.series([
    // Create .deploy folder
    function(next){
      file.mkdir(deployDir, next);
    },
    // Create placeholder file
    function(next){
      file.write(deployDir + 'index.html', 'Use <strong>hexo deploy</strong> to deploy.', next);
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
      if (config.branch !== 'master') command('git', ['branch', '-m', config.branch], next);
      else next();
    },
    function(next){
      spawn({
        command: 'git',
        args: ['remote', 'add', 'github', config.repository],
        options: {cwd: deployDir},
        exit: function(code){
          if (code === 0){
            next();
          } else {
            command('git', ['remote', 'set-url', 'github', config.repository], next);
          }
        }
      });
    }
  ], function(){
    console.log('Now you can deploy to %s with %s.', config.repository, clc.bold('hexo deploy'));
  });
};

extend.deployer.register('github', {
  deploy: deploy,
  setup: setup
});