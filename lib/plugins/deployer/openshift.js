var colors = require('colors'),
  path = require('path'),
  moment = require('moment'),
  spawn = require('child_process').spawn,
  util = require('../../util'),
  file = util.file2;

var run = function(command, args, callback){
  var cp = spawn(command, args);

  cp.stdout.on('data', function(data){
    process.stdout.write(data);
  });

  cp.stderr.on('data', function(data){
    process.stderr.write(data);
  });

  cp.on('close', callback);
};

module.exports = function(args, callback){
  var config = hexo.config.deploy,
    baseDir = hexo.base_dir,
    publicDir = hexo.public_dir;

  if (!config.remote){
    var help = [
      'You should configure deployment settings in _config.yml first!',
      '',
      'Example:',
      '  deploy:',
      '    type: openshift',
      '    remote: <upstream git remote>',
      '    branch: <upstraem git branch> (defaults to master)',
      '',
      'For more help, you can check the docs: ' + 'http://zespia.tw/hexo/docs/deployment.html'.underline
    ];

    console.log(help.join('\n'));
    return callback();
  }

  var blogDir = path.join(baseDir, '../diy', config.root),
    remote = config.remote,
    branch = config.branch || 'master';

  async.series([
    function(next){
      file.rmdir(blogDir, next);
    },
    function(next){
      file.copyDir(publicDir, blogDir, next);
    },
    function(next){
      var commands = [
        ['add', '-A', baseDir],
        ['add', '-A', blogDir],
        ['commit', '-m', 'Site updated: ' + moment().format('YYYY-MM-DD HH:mm:ss')],
        ['push', remote, branch, '--force']
      ];

      async.eachSeries(commands, function(item, next){
        run('git', item, function(){
          next();
        });
      }, next);
    }
  ], callback);
};