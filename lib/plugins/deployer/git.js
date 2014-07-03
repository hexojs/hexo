var async = require('async'),
  fs = require('fs'),
  path = require('path'),
  moment = require('moment'),
  spawn = require('child_process').spawn,
  util = require('../../util'),
  file = util.file2,
  commitMessage = require('./util').commitMessage;

module.exports = function(args, callback){
  var baseDir = args.deploy_dir || hexo.base_dir,
    deployDir = path.join(baseDir, '.deploy'),
    publicDir = hexo.public_dir;

  if (!args.repo && !args.repository){
    var help = '';

    help += 'You should configure deployment settings in _config.yml first!\n\n';
    help += 'Example:\n';
    help += '  deploy:\n';
    help += '    type: git\n';
    help += '    message: [message]\n';
    help += '    repo:\n';
    help += '      github: <repository url>,<branch>\n';
    help += '      gitcafe: <repository url>,<branch>\n\n';
    help += 'For more help, you can check the docs: ' + 'http://hexo.io/docs/deployment.html'.underline;

    console.log(help);
    return callback();
  }

  var repo = args.repo || args.repository;

  for (var t in repo){
    var s = repo[t].split(',');
    repo[t] = {};
    repo[t].url = s[0];
    repo[t].branch = s.length > 1 ? s[1] : 'master';
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

        hexo.log.i('Setting up Git deployment...');

        var commands = [['init']];

        if (args.master && repo[args.master]){
          var master = repo[args.master];
          hexo.log.i('fetch from ['+ args.master.green + ']:', master.url.cyan);
          commands.push(['remote', 'add', 'origin', '-t', master.branch, master.url]);
          commands.push(['pull']);
        } else {
          commands.push(['add', '-A', '.']);
          commands.push(['commit', '-m', 'First commit']);
        }

        for (var t in repo){
          commands.push(['remote', 'add', t, '-t', repo[t].branch, repo[t].url]);
        }

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
      ];

      for (var t in repo){
        commands.push(['push', '-u', t, 'master:' + repo[t].branch, '--force']);
      }

      async.eachSeries(commands, function(item, next){
        run('git', item, function(){
          next();
        });
      }, next);
    }
  ], callback);
};
