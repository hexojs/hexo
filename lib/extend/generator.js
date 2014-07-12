var ExtendError = require('../error').ExtendError;

var num = 0;

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
  * @type Object
  */

  this.store = {};
};

/**
* Returns a list of generator plugins.
*
* @method list
* @return {Object}
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

Generator.prototype.register = function(name, fn){
  if (!fn){
    if (typeof name === 'function'){
      fn = name;
      name = 'generator-' + num++;
    } else {
      throw new ExtendError('fn is required');
    }
  }

  this.store[name] = fn;
};