var extend = require('../../extend'),
  async = require('async'),
  fs = require('graceful-fs'),
  term = require('term'),
  util = require('../../util'),
  file = util.file,
  spawn = util.spawn,
  config = hexo.config.deploy;

extend.deployer.register('github', function(args, callback){
  if (!config.repository || !config.branch){
    console.log('\nYou should configure deployment settings in %s first!\n', '_config.yml'.bold);
    return console.log([
      'Example:',
      '  deploy:',
      '    type: github',
      '    repository: <repository>',
      '    branch: <branch>',
      '',
      'More info: http://zespia.tw/hexo/docs/deploy.html'
    ].join('\n') + '\n');
  }

  var deployDir = hexo.base_dir + '.deploy/',
    publicDir = hexo.public_dir,
    setup = args.setup;

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
    function(next){
      fs.exists(deployDir, function(exist){
        if (exist && !setup) return next();

        console.log('Setting up.');

        var commands = [
          ['init'],
          ['add', '-A'],
          ['commit', '-m', 'First commit'],
          ['branch', '-m', config.branch],
          ['remote', 'add', 'github', config.repository]
        ];

        file.write(deployDir + 'placeholder', '', function(err){
          if (err) throw new Error('Failed to write file: ' + deployDir + 'placeholder');

          async.forEachSeries(commands, function(item, next){
            command('git', item, next);
          }, function(){
            if (!setup) next();
          });
        });
      });
    },
    function(next){
      console.log('Clearing');
      file.empty(deployDir, next);
    },
    function(next){
      console.log('Copying files from public folder.');
      file.dir(publicDir, function(files){
        async.forEach(files, function(item, next){
          var dirs = item.split('/');

          for (var i=0, len=dirs.length; i<len; i++){
            if (dirs[i].substring(0, 1) === '.'){
              continue;
            }
          }

          file.copy(publicDir + item, deployDir + item, next);
        }, next);
      });
    },
    function(next){
      var commands = [
        ['add', '-A'],
        ['commit', '-m', 'Site updated: ' + new Date()],
        ['push', 'github', config.branch, '--force']
      ];

      async.forEachSeries(commands, function(item, next){
        command('git', item, next);
      }, next);
    }
  ], function(){
    console.log('Deploy completely.');
    callback();
  });
});