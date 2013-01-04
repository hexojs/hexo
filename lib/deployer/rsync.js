var clc = require('cli-color'),
  async = require('async'),
  fs = require('graceful-fs'),
  extend = require('../extend'),
  util = require('../util'),
  format = require('util').format,
  spawn = util.spawn,
  gConfig = hexo.config;

var displayHelp = function(){
  var help = [
    'Example:',
    '  deploy:',
    '    type: rsync',
    '    host: <host>',
    '    user: <user>',
    '    root: <root>',
    '    port: [port] # Default is 22',
    '    delete: [delete] # Default is true',
    '',
    'More info: http://zespia.tw/hexo/docs/deploy.html',
  ];

  console.log(help.join('\n') + '\n');
};

var command = function(comm, args, callback){
  spawn({
    command: comm,
    args: args,
    exit: function(code){
      if (code === 0) callback();
    }
  });
};

var deploy = function(){
  var config = gConfig.deploy;

  if (!config.host || !config.user){
    console.log('\nYou should configure deployment settings in %s first!\n', clc.bold('_config.yml'));
    return displayHelp();
  }
  if (!config.hasOwnProperty('delete')) config.delete = true;
  if (!config.port) config.port = 22;

  async.waterfall([
    // Check if public exists or not
    function(next){
      fs.exists(hexo.public_dir, function(exist){
        if (exist) next();
        else console.log('You have to use %s to generate files first.', clc.bold('hexo generate'));
      });
    },
    function(next){
      var command = ['-avz', '-e', 'ssh', '-p', config.port, 'public/', config.user + '@' + config.host + ':' + config.root];
      console.log('Syncing.');
      command('rsync', command);
    }
  ], function(){
    console.log('Deploy complete.');
  });
};

var setup = function(){
  console.log('\nNo need to setup for rsync deployment. Just configure deployment settings in %s and run %s.\n', clc.bold('_config.yml'), clc.bold('hexo deploy'));
  displayHelp();
};

extend.deployer.register('rsync', {
  deploy: deploy,
  setup: setup
});