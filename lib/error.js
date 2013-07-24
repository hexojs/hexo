/**
 * Wraps the error object with custom message.
 *
 * @param {Error} err
 * @param {String} msg
 * @return {Error}
 * @api private
 */

module.exports = function(err, msg){
  var stack = err.stack;

  err.name = 'Error';
  err.message = msg;
  err.stack = stack;

  return err;
};