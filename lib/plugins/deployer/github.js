var async = require('async'),
  fs = require('graceful-fs'),
  path = require('path'),
  colors = require('colors'),
  moment = require('moment'),
  spawn = require('child_process').spawn,
  util = require('../../util'),
  file = util.file2;

var log = hexo.log,
  baseDir = hexo.base_dir,
  deployDir = path.join(baseDir, '.deploy'),
  publicDir = hexo.public_dir;

// http://git-scm.com/docs/git-clone
var rRepo = /(:|\/)([^\/]+)\/([^\/]+)\.git\/?$/;

var run = function(command, args, callback){
  var cp = spawn(command, args, {cwd: deployDir});

  cp.stdout.on('data', function(data){
    process.stdout.write(data);
  });

  cp.stderr.on('data', function(data){
    process.stderr.write(data);
  });

  cp.on('close', callback);
};

module.exports = function(args, callback){
  var config = hexo.config.deploy;

  if (!config.repo && !config.repository){
    var help = [
      'You should configure deployment settings in _config.yml first!',
      '',
      'Example:',
      '  deploy:',
      '    type: github',
      '    repository: <repository url>',
      '',
      'For more help, you can check the online docs: ' + 'http://zespia.tw/hexo/'.underline
    ];

    console.log(help.join('\n'));
    return callback();
  }

  var url = config.repo || config.repository;

  if (!rRepo.test(url)){
    log.e(url + ' is not a valid repository URL!');
    return callback();
  }

  var match = url.match(rRepo),
    username = match[2],
    repo = match[3],
    rGh = new RegExp('^' + username + '\.github\.[io|com]', 'i');

  // https://help.github.com/articles/user-organization-and-project-pages
  if (repo.match(rGh)){
    var branch = 'master';
  } else {
    var branch = 'gh-pages'
  }

  async.series([
    // Set up
    function(next){
      fs.exists(deployDir, function(exist){
        if (exist && !args.setup) return next();

        log.i('Setting up github deployment...');

        var commands = [
          ['init'],
          ['add', '-A'],
          ['commit', '-m', 'First commit'],
          ['branch', '-M', branch],
          ['remote', 'add', 'github', url]
        ];

        file.writeFile(path.join(deployDir, 'placeholder'), '', function(err){
          if (err) callback(err);

          async.forEachSeries(commands, function(item, next){
            run('git', item, function(code){
              if (code == 0) next();
            });
          }, function(){
            if (!args.setup) next();
          });
        });
      });
    },
    function(next){
      log.i('Clearing .deploy folder...');

      file.emptyDir(deployDir, next);
    },
    function(next){
      log.i('Copying files from public folder...');

      file.copyDir(publicDir, deployDir, next);
    },
    function(next){
      var commands = [
        ['add', '-A'],
        ['commit', '-m', 'Site updated: ' + moment().format('YYYY-MM-DD HH:mm:ss')],
        ['push', 'github', branch, '--force']
      ];

      async.forEachSeries(commands, function(item, next){
        run('git', item, function(){
          next();
        });
      }, next);
    }
  ], callback);
};
