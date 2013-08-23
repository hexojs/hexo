var colors = require('colors'),
  spawn = require('child_process').spawn;

var log = hexo.log;

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
  var config = hexo.config.deploy;

  if (!config.host || !config.user || !config.root){
    var help = [
      'You should configure deployment settings in _config.yml first!',
      '',
      'Example:',
      '  deploy:',
      '    type: rsync',
      '    host: <host>',
      '    user: <user>',
      '    root: <root>',
      '    port: [port] # Default is 22',
      '    delete: [true|false] # Default is true',
      '',
      'For more help, you can check the online docs: ' + 'http://zespia.tw/hexo/'.underline
    ];

    console.log(help.join('\n'));
    return callback();
  }

  if (!config.hasOwnProperty('delete')) config.delete = true;
  if (!config.port) config.port = 22;

  if (config.port > 65535 || config.port < 1){
    config.port = 22;
  }

  var args = [
    config.delete === true ? '--delete' : '',
    '-avze',
    'ssh -p ' + config.port, 'public/', config.user + '@' + config.host + ':' + config.root
  ].filter(function(arg){ return arg });

  run('rsync', args, function(code){
    callback();
  });
};