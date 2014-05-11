var ExtendError = require('../error').ExtendError,
  Pattern = require('../box/pattern');

/**
* This class is used to manage all processor plugins in Hexo.
*
* @class Processor
* @constructor
* @namespace Extend
* @module hexo
*/

var Processor = module.exports = function(){
  /**
  * @property store
  * @type Array
  */

  this.store = [];
};

/**
* Returns a list of processor plugins.
*
* @method list
* @return {Array}
*/

Processor.prototype.list = function(){
  return this.store;
};

/**
* Register a processor plugin.
*
* @method register
* @param {String|RegExp} [rule]
* @param {Function} fn
*/

Processor.prototype.register = function(rule, fn){
  if (!fn){
    if (typeof rule === 'function'){
      fn = rule;
      rule = /(.*)/;
    } else {
      throw new ExtendError('fn is required');
    }
  }

  this.store.push({
    pattern: new Pattern(rule),
    process: fn
  });
};