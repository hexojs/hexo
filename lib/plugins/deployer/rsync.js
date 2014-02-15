var colors = require('colors'),
  spawn = require('child_process').spawn;

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
  if (!args.host || !args.user || !args.root){
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
      'For more help, you can check the docs: ' + 'http://zespia.tw/hexo/docs/deployment.html'.underline
    ];

    console.log(help.join('\n'));
    return callback();
  }

  if (!args.hasOwnProperty('delete')) args.delete = true;
  if (!args.port) args.port = 22;

  if (args.port > 65535 || args.port < 1){
    args.port = 22;
  }

  var params = [
    args.delete === true ? '--delete' : '',
    '-avze',
    'ssh -p ' + args.port, 'public/', args.user + '@' + args.host + ':' + args.root
  ].filter(function(arg){
    return arg;
  });

  run('rsync', params, function(code){
    callback();
  });
};