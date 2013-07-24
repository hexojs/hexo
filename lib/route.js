/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter,
  path = require('path'),
  _ = require('lodash');

/**
 * Route cache.
 */

var store = {};

/**
 * Creates a new EventEmitter instance.
 */

var Route = module.exports = new EventEmitter();

/**
 * Formats the given `str`.
 *
 *   - delete the prefixed `/`.
 *   - If the URL is `/` suffixed or the URL is a blank string, adds `index.html`
 *     at the end of the string.
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
 * Gets the specified route.
 *
 * @param {String} source
 * @return {Object}
 * @api public
 */

Route.get = function(source){
  return store[format(source)];
};

/**
 * Adds a route.
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
 * Removes the specified route.
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
 * Returns a object containing all routes.
 *
 * @api public
 */

Route.list = function(){
  return store;
};

/**
 * Clears all routes.
 *
 * @api public
 */

Route.clear = function(){
  store = {};
};