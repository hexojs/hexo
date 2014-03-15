var ExtendError = require('../error').ExtendError;

/**
* This class is used to manage all migrator plugins in Hexo.
*
* @class Migrator
* @constructor
* @namespace Extend
* @module hexo
*/

var Migrator = module.exports = function(){
  /**
  * @property store
  * @type Object
  */

  this.store = {};
};

/**
* Returns a list of migrator plugins.
*
* @method list
* @return {Object}
*/

Migrator.prototype.list = function(){
  return this.store;
};

/**
* Registers a migrator plugin.
*
* @method register
* @param {String} type
* @param {Function} fn
*/

Migrator.prototype.register = function(name, fn){
  if (typeof name === 'undefined'){
    throw new ExtendError('Migrator name is not defined');
  }

  if (typeof fn !== 'function'){
    throw new ExtendError('Migrator function is not defined');
  }

  this.store[name] = fn;
};