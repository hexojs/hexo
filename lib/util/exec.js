/**
 * Module dependencies.
 */

var exec = require('child_process').exec;

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
 *   - `callback`: Callback function
 *
 * @param {Object} options
 * @api public
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
