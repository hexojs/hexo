/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;

/**
 * Creates a new instance.
 *
 * @api private
 */

var Router = module.exports = function(){
  this.routes = {};
};

/**
 * Inherits from EventEmitter.
 */

Router.prototype.__proto__ = EventEmitter.prototype;

/**
 * Formats a URL.
 *
 *   - Deletes prefixed `/`.
 *   - Suffixs `index.html` if the URL is ended with `/`.
 *   - Replaces `\` with `/`.
 *
 * @param {String} str
 * @return {String}
 * @api public
 * @static
 */

var format = Router.prototype.format = function(str){
  if (str[0] === '/') str = str.substring(1);

  var last = str.substr(str.length - 1, 1);
  if (!last || last === '/') str += 'index.html';

  str = str.replace(/\\/g, '/');

  return str;
};

/**
 * Gets a route.
 *
 * @param {String} source
 * @return {Function}
 * @api public
 */

Router.prototype.get = function(source){
  return this.routes[format(source)];
};

/**
 * Sets a route.
 * If `callback.modified` is true, Hexo won't update file when generating.
 *
 * @param {String} source
 * @param {Any} callback
 * @return {Router} for chaining
 * @api public
 */

Router.prototype.set = function(source, callback){
  source = format(source);

  if (typeof callback === 'function'){
    var _callback = callback;
  } else {
    var _callback = function(fn){
      fn(null, callback);
    };
  }

  if (_callback.modified == null) _callback.modified = true;

  var route = this.routes[source] = _callback;

  this.emit('update', source, route);

  return this;
};

/**
 * Removes a route.
 *
 * @param {String} source
 * @return {Router} for chaining
 * @api public
 */

Router.prototype.remove = function(source){
  source = format(source);

  delete this.routes[source];

  this.emit('remove', source);

  return this;
};