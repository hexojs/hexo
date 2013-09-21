var async = require('async'),
  fs = require('graceful-fs'),
  path = require('path'),
  colors = require('colors'),
  moment = require('moment'),
  spawn = require('child_process').spawn,
  util = require('../../../util'),
  file = util.file2;

var log = hexo.log,
  baseDir = hexo.base_dir;

var run = function(command, args, callback){
  var cp = spawn(command, args, {cwd: baseDir});

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
      '    type: heroku',
      '    repository: <repository url>',
      '',
      'For more help, you can check the docs: ' + 'http://zespia.tw/hexo/docs/deployment.html'.underline
    ];

    console.log(help.join('\n'));
    return callback();
  }

  var url = config.repo || config.repository;

  async.series([
    function(next){
      var files = ['app.js', 'Procfile'];

      async.each(files, function(item, next){
        var src = path.join(__dirname, item),
          dest = path.join(baseDir, item);

        fs.exists(dest, function(exist){
          if (exist){
            next();
          } else {
            log.d('Copying %s...', item);
            file.copyFile(src, dest, next);
          }
        });
      }, next);
    },
    function(next){
      var packagePath = path.join(baseDir, 'package.json');

      var defaultPackage = JSON.stringify({
        name: 'hexo',
        version: hexo.version,
        private: true,
        dependencies: {
          connect: '2.x'
        }
      }, '  ');

      fs.exists(packagePath, function(exist){
        if (exist){
          try {
            var content = require(packagePath);

            if (content.dependencies){
              if (content.dependencies.connect){
                return next();
              } else {
                content.dependencies.connect = '2.x';
              }
            } else {
              content.dependencies = {
                connect: '2.x'
              };
            }

            log.d('Updating package.json...');
            file.writeFile(packagePath, JSON.stringify(content, '  '), next);
          } catch (e){
            log.d('Creating package.json...');
            file.writeFile(packagePath, defaultPackage, next);
          }
        } else {
          log.d('Creating package.json...');
          file.writeFile(packagePath, defaultPackage, next);
        }
      });
    },
    function(next){
      var gitPath = path.join(baseDir, '.git');

      fs.exists(gitPath, function(exist){
        if (exist) return next();

        var commands = [
          ['init'],
          ['remote', 'add', 'heroku', url]
        ];

        log.d('Initializing git...');

        async.eachSeries(commands, function(item, next){
          run('git', item, function(code){
            if (code == 0) next();
          });
        }, next);
      });
    },
    function(next){
      if (args.setup) return callback();

      var commands = [
        ['add', '-A'],
        ['commit', '-m', 'Site updated: ' + moment().format('YYYY-MM-DD HH:mm:ss')],
        ['push', 'heroku', 'master', '--force']
      ];

      async.eachSeries(commands, function(item, next){
        run('git', item, function(){
          next();
        });
      }, next);
    }
  ], callback);
};