var async = require('async'),
  fs = require('fs'),
  path = require('path'),
  moment = require('moment'),
  spawn = require('child_process').spawn,
  file = hexo.util.file2;

module.exports = function(args, callback){
  var config = hexo.config.deploy,
    baseDir = config.deploy_dir || hexo.base_dir,
    deployDir = path.join(baseDir, '.deploy'),
    publicDir = hexo.public_dir;

  if (!config.repo && !config.repository){
    var help = [
      'You should configure deployment settings in _config.yml first!',
      '',
      'Example:',
      '  deploy:',
      '    type: git',
      '    repo:',
      '      github: <repository url>,<branch>',
      '      gitcafe: <repository url>,<branch>',
      '',
      'For more help, you can check the docs: ' + 'http://zespia.tw/hexo/docs/deployment.html'.underline
    ];
    console.log(help.join('\n'));
    return callback();
  }

  var repo = config.repo || config.repository;
  for(t in repo){
    var s = repo[t].split(',');
    repo[t] = {};
    repo[t].url = s[0];
    repo[t].branch = s.length > 1?s[1]:'master';
  };

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
  
        if (config.master && repo[config.master]){
          var master = repo[config.master];
          console.log('fetch from ['+ config.master.green+ ']:',master.url.cyan);
          commands.push(['remote', 'add', 'origin', '-t', master.branch, master.url]);
          commands.push(['pull']);
        }else{
          commands.push(['add', '-A', '.']);
          commands.push(['commit', '-m', 'First commit']);
        }

        for(t in repo){
          commands.push(['remote', 'add', t, '-t', repo[t].branch, repo[t].url]);
        }

        file.writeFile(path.join(deployDir, 'placeholder'), '', function(err){
          if (err) callback(err);

          async.eachSeries(commands, function(item, next){
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
        ['commit', '-m', 'Site updated: ' + moment().format('YYYY-MM-DD HH:mm:ss')],
      ];

      for(t in repo){
        commands.push(['push', '-u',t,'master:'+ repo[t].branch, '--force']);
      }

      async.eachSeries(commands, function(item, next){
        run('git', item, function(){
          next();
        });
      }, next);
    }
  ], callback);
};
