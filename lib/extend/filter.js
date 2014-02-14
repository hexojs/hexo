var ExtendError = require('../error').ExtendError;

/**
* This class is used to manage all filter plugins in Hexo.
*
* @class Filter
* @constructor
* @namespace Extend
* @module hexo
*/

var Filter = module.exports = function(){
  /**
  * @property store
  * @type Object
  */

  this.store = {
    pre: [],
    post: []
  };
};

/**
* Returns a list of filter plugins.
*
* @method list
* @return {Object}
*/

Filter.prototype.list = function(){
  return this.store;
};

/**
* Registers a filter plugin.
*
* @method register
* @param {String} [type=post] The type of filter plugins can be either `pre` or `post`.
* @param {Function} fn
*/

Filter.prototype.register = function(type, fn){
  if (!fn){
    if (typeof type === 'function'){
      fn = type;
      type = 'post';
    } else {
      throw new ExtendError('Filter function is not defined');
    }
  }

  if (type !== 'pre' && type !== 'post'){
    throw new ExtendError('Filter type must be either pre or post');
  }

  this.store[type].push(fn);
};