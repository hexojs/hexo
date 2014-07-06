var async = require('async'),
  domain = require('domain'),
  HexoError = require('../error'),
  ExtendError = HexoError.ExtendError;

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
  pre: 'before_post_render',
  post: 'after_post_render'
};

/**
* Registers a filter plugin.
*
* @method register
* @param {String} [type=after_post_render] The type of filter plugins.
* @param {Function} fn
* @param {Number} [priority=10] The execution priority of the plugin. It must be a positive number.
*/

Filter.prototype.register = function(type, fn, priority){
  if (!fn){
    if (typeof type === 'function'){
      fn = type;
      type = 'after_post_render';
    } else {
      throw new ExtendError('fn is required');
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
* @param {Function} [callback]
* @param {Object} [context]
*/

Filter.prototype.apply = function(type, args, callback, context){
  if (!args) args = [];
  if (!Array.isArray(args)) args = [args];

  var list = this.list(type),
    d = domain.create(),
    called = false;

  if (typeof callback === 'function'){
    var results = [];

    d.on('error', function(err){
      !called && callback(err);
      called = true;
    });

    async.eachSeries(list, function(filter, next){
      d.add(filter);

      d.run(function(){
        filter.apply(context, [].concat(args, function(err, result){
          d.remove(filter);
          if (err) return next(err);

          if (result) results.push(result);
          next();
        }));
      });
    }, function(err){
      if (err) return callback(err);

      callback(null, results);
    });
  } else {
    var result;

    d.on('error', function(err){
      hexo.log.e(err);
    });

    list.forEach(function(filter){
      d.add(filter);

      d.run(function(){
        result = filter.apply(context, args);
        d.remove(filter);
      });
    });

    return result;
  }
};

var filterFunction = function(a, b){
  return a.toString() !== b.toString();
};

/**
* Unregisters a filter plugin.
*
* @method unregister
* @param {String} type
* @param {Function} [fn] If `fn` is not defined, all filter plugins of the specified type will be unregistered.
*/

Filter.prototype.unregister = function(type, fn){
  var store = this.store[type];
  if (!store) return;

  if (typeof fn === 'function'){
    var keys = Object.keys(store);

    for (var i = 0, len = keys.length; i < len; i++){
      var key = keys[i];

      store[key] = store[key].filter(filterFunction(filter, fn));
    }
  } else {
    this.store[type] = {};
  }
};