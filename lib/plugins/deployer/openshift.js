var extend = require('../../extend'),
  async = require('async'),
  fs = require('graceful-fs'),
  util = require('../../util'),
  file = util.file,
  spawn = util.spawn,
  config = hexo.config;

extend.deployer.register('openshift', function(args, callback){
  if (!config.deploy.remote){
    console.log('\nYou should configure deployment settings in %s first!\n', '_config.yml'.bold);
    return console.log([
      'Example:',
      '  deploy:',
      '    type: openshift',
      '    remote: <upstream git remote>',
      '    branch: <upstraem git branch> (defaults to master)'
    ].join('\n') + '\n');
  }

  var baseDir = hexo.base_dir
    , blogDir = baseDir + '../diy' + config.root
    , generatedDir = baseDir + 'public/'
    , remote = config.deploy.remote
    , branch = config.deploy.branch || 'master';

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
      console.log('Deleting old public to blog root.');
      command('rm', ['-fr', blogDir], next());
    },
    function(next){
      console.log('Copying public to blog root.');
      command('cp', ['-r', generatedDir, blogDir], next());
    },
    function(next){
      console.log('Adding updated blog to git versioning.');
      var commands = [
        ['add', '-A', baseDir],
        ['add', '-A', blogDir],
        ['commit', '-m', 'Blog updated: ' + new Date()],
        ['push', remote, branch, '--force']
      ];

      async.forEachSeries(commands, function(item, next){
        command('git', item, next);
        // console.log('DEBUG: would call git with ' + item.join(' '));
        next();
      }, next);
    }
  ], function(){
    console.log('Deploy completely.');
    callback();
  });
});
