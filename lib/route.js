/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter,
  path = require('path'),
  _ = require('lodash');

/**
 * Create a object to store routes in use.
 */

var store = {};

/**
 * Create a new EventEmitter instance and expose it.
 */

var Route = module.exports = new EventEmitter();

/**
 * Format the given `str`.
 *
 *   - delete the prefixed `/`.
 *   - suffix `index.html` the URL is `/` suffixed or the URL is a blank string.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */

var format = Route.format = function(str){
  if (str.substr(0, 1) === '/') str = str.substring(1);

  var last = str.substr(str.length - 1, 1);
  if (!last || last === '/') str += 'index.html';

  return str;
};

/**
 * Get the route from `store` object.
 *
 * @param {String} source
 * @return {Object}
 * @api public
 */

Route.get = function(source){
  return store[format(source)];
};

/**
 * Add the route to `store` object.
 *
 * @param {String} source
 * @param {Function|String} callback
 * @api public
 */

Route.set = function(source, callback){
  source = format(source);

  if (_.isFunction(callback)){
    var _callback = callback;
  } else {
    var _callback = function(fn){
      fn(null, callback, source);
    };
  }

  if (_callback.modified == null) _callback.modified = true;

  store[source] = _callback;

  this.emit('update', source, store[source]);
};

/**
 * Remove the route from `store` object.
 *
 * @param {String} source
 * @api public
 */

Route.remove = function(source){
  source = format(source);
  delete store[source];
  this.emit('remove', source);
};

/**
 * Return `store` object.
 *
 * @api public
 */

Route.list = function(){
  return store;
};

/**
 * Clear all elements in `store` object.
 *
 * @api public
 */

Route.clear = function(){
  store = {};
};