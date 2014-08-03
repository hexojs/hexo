var async = require('async'),
  fs = require('graceful-fs'),
  path = require('path'),
  colors = require('colors'),
  swig = require('swig'),
  spawn = require('child_process').spawn,
  util = require('../../util'),
  file = util.file2,
  commitMessage = require('./util').commitMessage;

// http://git-scm.com/docs/git-clone
var rRepo = /(:|\/)([^\/]+)\/([^\/]+)\.git\/?$/;

module.exports = function(args, callback){
  var baseDir = hexo.base_dir,
    deployDir = path.join(baseDir, '.deploy'),
    publicDir = hexo.public_dir;

  if (!args.repo && !args.repository){
    var help = '';

    help += 'You should configure deployment settings in _config.yml first!\n\n';
    help += 'Example:\n';
    help += '  deploy:\n';
    help += '    type: github\n';
    help += '    repo: <repository url>\n';
    help += '    branch: [branch]\n';
    help += '    message: [message]\n\n';
    help += 'For more help, you can check the docs: ' + 'http://hexo.io/docs/deployment.html'.underline;

    console.log(help);
    return callback();
  }

  var url = args.repo || args.repository;

  if (!rRepo.test(url)){
    hexo.log.e(url + ' is not a valid repository URL!');
    return callback();
  }

  var branch = args.branch;

  if (!branch){
    var match = url.match(rRepo),
      username = match[2],
      repo = match[3],
      rGh = new RegExp('^' + username + '\\.github\\.[io|com]', 'i');

    // https://help.github.com/articles/user-organization-and-project-pages
    if (repo.match(rGh)){
      branch = 'master';
    } else {
      branch = 'gh-pages';
    }
  }

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

  async.series([
    // Set up
    function(next){
      fs.exists(deployDir, function(exist){
        if (exist && !args.setup) return next();

        hexo.log.i('Setting up GitHub deployment...');

        var commands = [
          ['init'],
          ['add', '-A', '.'],
          ['commit', '-m', 'First commit']
        ];

        if (branch !== 'master') commands.push(['branch', '-M', branch]);

        file.writeFile(path.join(deployDir, 'placeholder'), '', function(err){
          if (err) callback(err);

          async.eachSeries(commands, function(item, next){
            run('git', item, function(code){
              if (code === 0) next();
            });
          }, function(){
            if (!args.setup) next();
          });
        });
      });
    },
    function(next){
      hexo.log.i('Clearing .deploy folder...');

      file.emptyDir(deployDir, next);
    },
    function(next){
      hexo.log.i('Copying files from public folder...');

      file.copyDir(publicDir, deployDir, next);
    },
    function(next){
      var commands = [
        ['add', '-A'],
        ['commit', '-m', commitMessage(args)],
        ['push', '-u', url, branch, '--force']
      ];

      async.eachSeries(commands, function(item, next){
        run('git', item, function(){
          next();
        });
      }, next);
    }
  ], callback);
};
