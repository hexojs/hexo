var _ = require('lodash');

var store = {};

/**
* This module is used to manage local variables used in templates.
*
* @class Locals
* @param {Object} [locals]
* @static
* @namespace Hexo
* @module Hexo
*/

var Locals = module.exports = function(locals){
  _.extend(store, locals);
};

/**
* Iterates over all elements in the object.
*
* `each` is also aliased as `forEach`.
*
* @method each
* @param {Function} iterator
* @static
*/

Locals.forEach = Locals.each = function(iterator){
  _.each(store, iterator);
};

/**
* Generate a static object.
*
* @method _generate
* @return {Object}
* @private
* @static
*/

Locals._generate = function(){
  var obj = {};

  this.each(function(val, name){
    obj[name] = typeof val === 'function' ? val() : val;
  });

  return obj;
};