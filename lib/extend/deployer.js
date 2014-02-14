var ExtendError = require('../error').ExtendError;

/**
* This class is used to manage all deployer plugins in Hexo.
*
* @class Deployer
* @constructor
* @namespace Extend
* @module hexo
*/

var Deployer = module.exports = function(){
  /**
  * @property store
  * @type Object
  */

  this.store = {};
};

/**
* Returns a list of deployer plugins.
*
* @method list
* @return {Object}
*/

Deployer.prototype.list = function(){
  return this.store;
};

/**
* Registers a deployer plugin.
*
* @method register
* @param {String} name
* @param {Function} fn
*/

Deployer.prototype.register = function(name, fn){
  if (typeof fn !== 'function'){
    throw new ExtendError('Deployer function is not defined')
  }
  this.store[name] = fn;
};