var ExtendError = require('../error').ExtendError;

/**
* This class is used to manage all swig plugins in Hexo.
*
* @class Swig
* @constructor
* @namespace Hexo.Extend
* @module hexo
*/

var Swig = module.exports = function(){
  /**
  * @property store
  * @type Object
  */

  this.store = {};
};

/**
* Returns a list of swig plugins.
*
* @method list
* @return {Object}
*/

Swig.prototype.list = function(){
  return this.store;
};

/**
* Registers a swig plugin.
*
* @method register
* @param {String} name
* @param {Function} fn
* @param {Boolean} [ends=false]
*/

Swig.prototype.register = function(name, fn, ends){
  if (typeof fn !== 'function'){
    throw new ExtendError('Swig function is not defined');
  }

  var swig = this.store[name] = fn;
  if (ends) swig.ends = true;
};