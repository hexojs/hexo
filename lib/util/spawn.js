var spawn = require('child_process').spawn;

/**
* Launches a new process.
*
* @method spawn
* @param {Object} options
*   @param {String} options.command The command to run
*   @param {Array} options.args The list of string arguments
*   @param {Object} [options.options] See [child_process.spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)
* @for util
*/

module.exports = function(options){
  var comm = spawn(options.command, options.args, options.options);

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