var async = require('async'),
  fs = require('graceful-fs'),
  path = require('path'),
  colors = require('colors'),
  spawn = require('child_process').spawn,
  util = require('../../../util'),
  file = util.file2,
  commitMessage = require('../util').commitMessage;

module.exports = function(args, callback){
  if (!args.repo && !args.repository){
    var help = '';

    help += 'You should configure deployment settings in _config.yml first!\n\n';
    help += 'Example:\n';
    help += '  deploy:\n';
    help += '    type: heroku\n';
    help += '    repo: <repository url>\n';
    help += '    message: [message]\n\n';
    help += 'For more help, you can check the docs: ' + 'http://hexo.io/docs/deployment.html'.underline;

    console.log(help);
    return callback();
  }

  var url = args.repo || args.repository,
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
            hexo.log.d('Copying %s...', item);
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

            hexo.log.d('Updating package.json...');
            file.writeFile(packagePath, JSON.stringify(content, '  '), next);
          } catch (e){
            hexo.log.d('Creating package.json...');
            file.writeFile(packagePath, defaultPackage, next);
          }
        } else {
          hexo.log.d('Creating package.json...');
          file.writeFile(packagePath, defaultPackage, next);
        }
      });
    },
    function(next){
      var gitPath = path.join(baseDir, '.git');

      fs.exists(gitPath, function(exist){
        if (exist) return next();

        var commands = [
          ['init']
        ];

        hexo.log.d('Initializing git...');

        async.eachSeries(commands, function(item, next){
          run('git', item, function(code){
            if (code === 0) next();
          });
        }, next);
      });
    },
    function(next){
      if (args.setup) return callback();

      var commands = [
        ['add', '-A', '.'],
        ['commit', '-m', commitMessage(args)],
        ['push', '-u', url, 'master', '--force']
      ];

      async.eachSeries(commands, function(item, next){
        run('git', item, function(){
          next();
        });
      }, next);
    }
  ], callback);
};