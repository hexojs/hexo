var exec = require('child_process').exec;

module.exports = function(options){
  var comm = exec(options.command, options.options, options.callback);

  comm.stdout.setEncoding('utf8');
  comm.stderr.setEncoding('utf8');

  if (options.stdout){
    comm.stdout.on('data', options.stdout);
  } else {
    comm.stdout.on('data', function(data){
      process.stdout.write(data);
    });
  }

  if (options.stderr){
    comm.stderr.on('data', options.stderr);
  } else {
    comm.stderr.on('data', function(data){
      process.stderr.write(data);
    });
  }

  if (options.exit){
    comm.on('exit', options.exit);
  }
};
