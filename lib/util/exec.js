var exec = require('child_process').exec;

/**
* Runs a command in a shell and buffers the output.
*
* @method exec
* @param {Object} options
*   @param {String} options.command The command to run, with space-separated arguments
*   @param {Object} [options.options] See [child_process.exec](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)
*   @param {Function} options.callback
* @for util
* @static
*/

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
