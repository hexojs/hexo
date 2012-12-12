var clc = require('cli-color'),
  extend = require('../extend'),
  util = require('../util'),
  file = util.file,
  spawn = util.spawn;

var displayHelp = function(){
  var help = [
    '',
    'You should configure deployment settings in ' + clc.bold('_config.yml') + ' first!',
    '',
    'Example:',
    '  deploy:',
    '    type: rsync',
    '    repository: <repository>',
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

};

var setup = function(){

};

extend.deployer.register('rsync', {
  deploy: deploy,
  setup: setup
});