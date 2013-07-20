var extend = require('../../extend'),
  term = require('term'),
  util = require('../../util'),
  spawn = util.spawn,
  config = hexo.config.deploy;

extend.deployer.register('rsync', function(args, callback){
  if (!config.host || !config.user || !config.root){
    console.log('\nYou should configure deployment settings in %s first!\n', '_config.yml'.bold);
    return console.log([
      'Example:',
      '  deploy:',
      '    type: rsync',
      '    host: <host>',
      '    user: <user>',
      '    root: <root>',
      '    port: [port] # Default is 22',
      '    delete: [true|false] # Default is true',
      '',
      'More info: http://zespia.tw/hexo/docs/deploy.html'
    ].join('\n') + '\n');
  }

  if (!config.hasOwnProperty('delete')) config.delete = true;
  if (!config.port) config.port = 22;

  var args = [
    config.delete === true ? '--delete' : '',
    '-avze',
    'ssh -p ' + config.port, 'public/', config.user + '@' + config.host + ':' + config.root
  ].filter(function(arg){ return arg });

  spawn({
    command: 'rsync',
    args: args,
    exit: function(code){
      if (code === 0){
        console.log('Deploy completely.');
        callback();
      }
    }
  });
});
