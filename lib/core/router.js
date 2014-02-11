var EventEmitter = require('events').EventEmitter;

/**
* This module is used to manage routes.
*
* @class Router
* @constructor
* @extends EventEmitter
* @module hexo
*/

var Router = module.exports = function(){
  /**
  * @property routes
  * @type Object
  */

  this.routes = {};
};

Router.prototype.__proto__ = EventEmitter.prototype;

/**
* Formats URL.
*
* This function does:
*
* - Removes prefixed slashes.
* - Appends `index.html` to the URL with trailing slash.
* - Replaces all backslashes with slash.
*
* @method format
* @param {String} str
* @return {String}
*/

var format = Router.prototype.format = function(str){
  if (str[0] === '/') str = str.substring(1);

  var last = str.substr(str.length - 1, 1);
  if (!last || last === '/') str += 'index.html';

  str = str.replace(/\\/g, '/');

  return str;
};

/**
* Gets a router.
*
* **Example:**
*
* ``` js
* var route = router.get('index.html');
*
* route(function(err, content){
*   // do something...
* });
* ```
*
* @method get
* @param {String} source
* @return {Function}
*/

Router.prototype.get = function(source){
  return this.routes[format(source)];
};

/**
* Sets a router.
*
* You can use either a function:
*
* ```
* router.set('index.html', function(callback){
*   fs.readFile('index.txt', function(err, content){
*     if (err) return callback(err);
*
*     callback(null, content);
*   });
* });
* ```
*
* or a string:
*
* ```
* router.set('foo.html', 'foo');
* ```
*
* @method set
* @param {String} source
* @param {Any} callback
* @chainable
*/

Router.prototype.set = function(source, callback){
  var _callback;

  source = format(source);

  if (typeof callback === 'function'){
    _callback = callback;
  } else {
    _callback = function(fn){
      fn(null, callback);
    };
  }

  if (typeof _callback.modified === 'undefined') _callback.modified = true;

  var route = this.routes[source] = _callback;

  /**
  * Fired when a route updated.
  *
  * @event update
  * @param {String} source
  * @param {Function} route
  */

  this.emit('update', source, route);

  return this;
};

/**
* Removes a router.
*
* @method remove
* @param {String} source
* @chainable
*/

Router.prototype.remove = function(source){
  source = format(source);

  delete this.routes[source];

  /**
  * Fired when a route removed.
  *
  * @event remove
  * @param {String} source
  */

  this.emit('remove', source);

  return this;
};