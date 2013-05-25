var extend = require('../../extend'),
  term = require('term'),
  util = require('../../util'),
  exec = util.exec,
  spawn = util.spawn,
  config = hexo.config.deploy;

extend.deployer.register('ftp', function(args, callback){
  if (!config.host || !config.user || !config.root){
    console.log('\nYou should configure deployment settings in %s first!\n', '_config.yml'.bold);
    return console.log([
      'Example:',
      '  deploy:',
      '    type: ftp',
      '    host: <host>',
      '    port: [port] # Default is 21',
      '    user: <user>',
      '    password: <password>',
      '    root: <root>',
      '',
      'More info: http://zespia.tw/hexo/docs/deploy.html'
    ].join('\n') + '\n');
  }

  if (!config.port) config.port = 21;

  var cmd = 'cd public && ncftpput -R -u ' + config.user + ' -p ' + config.password + ' -P ' + config.port + ' ' + config.host + ' ' + config.root + ' *';
  exec({
    command: cmd,
    exit: function(code){
      if (code === 0){
        console.log('Deploy completely.');
        callback();
      }
    }
  });
});
