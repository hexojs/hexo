var ExtendError = require('../error').ExtendError;

/**
* This class is used to manage all helper plugins in Hexo.
*
* @class Helper
* @constructor
* @namespace Extend
* @module hexo
*/

var Helper = module.exports = function(){
  /**
  * @property store
  * @type Object
  */

  this.store = {};
};

/**
* Returns a list of helper plugins.
*
* @method list
* @return {Object}
*/

Helper.prototype.list = function(){
  return this.store;
};

/**
* Registers a helper plugin.
*
* @method register
* @param {String} name
* @param {Function} fn
*/

Helper.prototype.register = function(name, fn){
  if (!name) throw new ExtendError('name is required');
  if (typeof fn !== 'function') throw new ExtendError('fn is required');

  this.store[name] = fn;
};