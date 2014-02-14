/**
* An error class used in Hexo.
*
* @class Error
* @param {String} msg
* @constructor
* @module hexo
* @namespace Hexo
*/

var HexoError = module.exports = function(msg){
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.message = msg;
  this.name = 'HexoError';
};

HexoError.prototype.__proto__ = Error.prototype;

HexoError.ExtendError = require('./extend');

/**
* Replace the error message with the string.
*
* @method wrap
* @param {Error} err
* @param {String} msg
* @return {Error}
* @static
*/

HexoError.wrap = function(err, msg){
  var stack = err.stack;

  err.name = 'HexoError';
  err.message = msg;
  err.stack = stack;

  return err;
};