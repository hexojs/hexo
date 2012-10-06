var spawn = require('child_process').spawn;

module.exports = function(command, stdout, stderr, callback){
  var arr = command.split(' '),
    first = arr.shift(),
    comm = arr.length ? spawn(first, arr) : spawn(first);

  comm.stdout.setEncoding('utf8');
  comm.stdout.on('data', stdout);

  comm.stderr.setEncoding('utf8');
  comm.stderr.on('data', stderr);

  comm.on('exit', callback);
};