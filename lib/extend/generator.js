var ExtendError = require('../error').ExtendError;

/**
* This class is used to manage all generator plugins in Hexo.
*
* @class Generator
* @constructor
* @namespace Extend
* @module hexo
*/

var Generator = module.exports = function(){
  /**
  * @property store
  * @type Array
  */

  this.store = [];
};

/**
* Returns a list of generator plugins.
*
* @method list
* @return {Array}
*/

Generator.prototype.list = function(){
  return this.store;
};

/**
* Registers a generator plugin.
*
* @method register
* @param {Function} fn
*/

Generator.prototype.register = function(fn){
  if (typeof fn !== 'function') throw new ExtendError('fn is required');

  this.store.push(fn);
};