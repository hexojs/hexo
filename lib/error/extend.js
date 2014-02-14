var HexoError = require('./index');

/**
* An error class used in Hexo extensions.
*
* @class ExtendError
* @param {String} msg
* @constructor
* @extends Hexo.Error
* @module hexo
* @namespace Hexo.Error
*/

var ExtendError = module.exports = function(msg){
  HexoError.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'ExtendError';
};

ExtendError.prototype.__proto__ = HexoError.prototype;