var spawn = require('child_process').spawn;

module.exports = function(options){
  var comm = spawn(options.command, options.args, options.options);

  comm.stdout.setEncoding('utf8');
  comm.stderr.setEncoding('utf8');

  if (options.stdout){
    comm.stdout.on('data', options.stdout);
  } else {
    comm.stdout.on('data', function(data){
      console.log(data);
    });
  }

  if (options.stderr){
    comm.stderr.on('data', options.stderr);
  } else {
    comm.stderr.on('data', function(data){
      console.log(data);
    });
  }

  if (options.exit){
    comm.on('exit', options.exit);
  }
};