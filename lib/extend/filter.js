var async = require('async'),
  ExtendError = require('../error').ExtendError;

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

  this.store = {};
};

/**
* Returns a list of filter plugins. Use `type` argument to get filter plugins of a specified type.
*
* @method list
* @param {String} [type]
* @return {Object|Array}
*/

Filter.prototype.list = function(type){
  if (type){
    var store = this.store[type];
    if (!store) return [];

    var keys = Object.keys(store),
      list = [];

    keys.sort(function(a, b){
      return a - b;
    });

    for (var i = 0, len = keys.length; i < len; i++){
      list = list.concat(store[keys[i]]);
    }

    return list;
  } else {
    return this.store;
  }
};

var typeAlias = {
  pre: 'beforePostRender',
  post: 'afterPostRender'
};

/**
* Registers a filter plugin.
*
* @method register
* @param {String} [type=afterPostRender] The type of filter plugins.
* @param {Function} fn
* @param {Number} [priority=10] The execution priority of the plugin. It must be a positive number.
*/

Filter.prototype.register = function(type, fn, priority){
  if (!fn){
    if (typeof type === 'function'){
      fn = type;
      type = 'afterPostRender';
    } else {
      throw new ExtendError('Filter function is not defined');
    }
  }

  type = typeAlias[type] || type;

  priority = priority ? +priority : 10;

  if (!this.store.hasOwnProperty(type)) this.store[type] = {};
  if (!this.store[type].hasOwnProperty(priority)) this.store[type][priority] = [];

  this.store[type][priority].push(fn);
};

/**
* Runs all filter plugins of a specified type.
*
* @method apply
* @param {String} type
* @param {Array} [args]
* @param {Boolean} [callback]
*/

Filter.prototype.apply = function(type, args, callback){
  if (!args) args = [];
  if (!Array.isArray(args)) args = [args];

  var list = this.list(type);

  if (typeof callback === 'function'){
    args = [].concat(args, callback);

    async.eachSeries(list, function(filter, next){
      filter.apply(null, args);
    }, callback);
  } else {
    for (var i = 0, len = list.length; i < len; i++){
      filter.apply(null, args);
    }
  }
};

/**
* Unregisters a filter plugin.
*
* @method unregister
* @param {String} type
* @param {Function} fn
*/

Filter.prototype.unregister = function(type, fn){
  var store = this.store[type];
  if (!store) return;

  var keys = Object.keys(store);

  for (var i = 0, len = keys.length; i < len; i++){
    var key = keys[i];

    store[key] = store[key].filter(function(filter){
      return filter.toString() !== fn.toString();
    });
  }
};