var extend = require('../../extend'),
  async = require('async'),
  fs = require('graceful-fs'),
  colors = require('colors'),
  _ = require('underscore'),
  util = require('../../util'),
  file = util.file,
  spawn = util.spawn,
  config = hexo.config.deploy;

extend.deployer.register('heroku', function(args){
  if (!config.repository){
    console.log('\nYou should configure deployment settings in %s first!\n', '_config.yml'.bold);
    return console.log([
      'Example:',
      '  deploy:',
      '    type: heroku',
      '    repository: <repository>',
      '',
      'More info: http://zespia.tw/hexo/docs/deploy.html'
    ].join('\n') + '\n');
  }

  var baseDir = hexo.base_dir,
    setup = args.setup;

  var command = function(comm, args, callback){
    spawn({
      command: comm,
      args: args,
      exit: function(code){
        if (code === 0) callback();
      }
    });
  };

  async.series([
    function(next){
      async.every(['Procfile', 'app.js'], function(item, next){
        fs.exists(baseDir + item, function(exist){
          next(null, exist);
        });
      }, function(result){
        if (result && !setup) return next();

        console.log('Setting up.');

        async.parallel([
          function(next){
            file.write(baseDir + 'Procfile', 'web: node app', next);
          },
          function(next){
            file.read(baseDir + 'package.json', function(err, content){
              if (err) throw new Error('Failed to read file: ' + baseDir + 'package.json');
              var pkg = JSON.parse(content);
              if (_.isObject(pkg.dependencies)){
                pkg.dependencies = _.extend(pkg.dependencies, {connect: '*'});
              } else {
                pkg.dependencies = {connect: '*'};
              }

              file.write(baseDir + 'package.json', JSON.stringify(pkg, null, '  ') + '\n', next);
            });
          },
          function(next){
            var content = [
              'var connect = require("connect"),',
              '  app = connect.createServer(),',
              '  port = process.env.PORT;',
              '',
              'app.use(connect.static(__dirname + "/public"));',
              'app.use(connect.compress());',
              '',
              'app.listen(port, function(){',
              '  console.log("Hexo is running on port %d.", port);',
              '});'
            ];

            file.write(baseDir + 'app.js', content.join('\n'), next);
          },
          function(next){
            command('git', ['init'], function(){
              command('git', ['remote', 'add', 'heroku', config.repository], next);
            });
          }
        ], function(){
          if (!setup) next();
        });
      });
    },
    function(next){
      var commands = [
        ['add', '-A'],
        ['commit', '-m', 'Site updated: ' + new Date()],
        ['push', 'heroku', 'master', '--force']
      ];

      async.forEachSeries(commands, function(item, next){
        command('git', item, next);
      }, next);
    }
  ], function(){
    console.log('Deploy completely.');
  });
});