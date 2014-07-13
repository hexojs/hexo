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
    var help = '';

    help += 'You should configure deployment settings in _config.yml first!\n\n';
    help += 'Example:\n';
    help += '  deploy:\n';
    help += '    type: rsync\n';
    help += '    host: <host>\n';
    help += '    user: <user>\n';
    help += '    root: <root>\n';
    help += '    port: [port] # Default is 22\n';
    help += '    delete: [true|false] # Default is true\n';
    help += '    verbose: [true|false] # Default is true\n';
    help += '    ignore_errors: [true|false] # Default is false\n\n';
    help += 'For more help, you can check the docs: ' + 'http://hexo.io/docs/deployment.html'.underline;

    console.log(help);
    return callback();
  }

  if (!args.hasOwnProperty('delete')) args.delete = true;
  if (!args.port) args.port = 22;
  if (!args.hasOwnProperty('verbose')) args.verbose = true;

  if (args.port > 65535 || args.port < 1){
    args.port = 22;
  }

  var params = [
    args.delete === true ? '--delete' : '',
    args.verbose === true ? '-v' : '',
    args.ignore_errors === true ? '--ignore-errors' : '',
    '-az',
    'public/',
    '-e',
    'ssh -p ' + args.port,
    args.user + '@' + args.host + ':' + args.root
  ].filter(function(arg){
    return arg;
  });

  run('rsync', params, function(code){
    callback(code ? 'Deploy failed: rsync (code ' + code + ')' : null);
  });
};