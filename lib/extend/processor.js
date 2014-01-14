var ExtendError = require('../error').ExtendError;

var rParam = /(\()?([:\*])(\w*)\)?/g;

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
* Formats the rule.
*
* @method format
* @param {String} rule
* @return {Object}
*/

var format = Processor.prototype.format = function(rule){
  var params = [];

  var regex = rule.replace(/(\/|\.)/g, '\\$&')
    .replace(rParam, function(match, optional, operator, name){
      params.push(name);

      if (operator === '*'){
        var str = '(.*?)'
      } else {
        var str = '([^\\/]+)'
      }

      if (optional) str += '?';

      return str;
    });

  var pattern = new RegExp('^' + regex + '$');

  return {
    pattern: pattern,
    params: params
  };
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
      throw new ExtendError('Processor function is not defined');
    }
  }

  if (rule instanceof RegExp){
    var pattern = rule;
  } else {
    var obj = format(rule),
      pattern = obj.pattern,
      params = obj.params;
  }

  this.store.push({
    pattern: pattern,
    params: params || [],
    fn: fn
  });
};