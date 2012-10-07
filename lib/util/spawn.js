var spawn = require('child_process').spawn;

module.exports = function(command, sub, stdout, stderr, callback){
  var comm = sub && sub.length ? spawn(command, sub) : spawn(command);

  comm.stdout.setEncoding('utf8');
  comm.stdout.on('data', stdout);

  comm.stderr.setEncoding('utf8');
  comm.stderr.on('data', stderr);

  comm.on('exit', callback);
};