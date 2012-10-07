var spawn = require('child_process').spawn;

module.exports = function(command, sub, options, stdout, stderr, callback){
  var comm = spawn(command, sub, options);

  comm.stdout.setEncoding('utf8');
  comm.stdout.on('data', stdout);

  comm.stderr.setEncoding('utf8');
  comm.stderr.on('data', stderr);

  comm.on('exit', callback);
};