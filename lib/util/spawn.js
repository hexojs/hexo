/**
 * Module dependencies.
 */

var spawn = require('child_process').spawn;

/**
 * Launch a new process with the given `options`.
 *
 * Properties:
 *
 *   - `command`: The command to run
 *   - `args`: Array list of string arguments
 *   - `options`: Options
 *   - `stdout`: Called when process prints info
 *   - `stderr`: Called when error occurred
 *   - `exit`: Called when process exits
 *
 * @param {Object} options
 * @api public
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