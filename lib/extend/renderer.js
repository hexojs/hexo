var ExtendError = require('../error').ExtendError,
  pathFn = require('path'),
  domain = require('domain');

/**
* This class is used to manage all renderer plugins in Hexo.
*
* @class Renderer
* @constructor
* @namespace Extend
* @module hexo
*/

var Renderer = module.exports = function(){
  /**
  * @property store
  * @type Object
  */

  this.store = {};

  /**
  * @property storeSync
  * @type Object
  */

  this.storeSync = {};
};

/**
* Returns a list of renderer plugins.
*
* @method list
* @param {Boolean} sync
* @return {Object}
*/

Renderer.prototype.list = function(sync){
  return sync ? this.storeSync : this.store;
};

/**
* Registers a renderer plugin.
*
* @method register
* @param {String} name
* @param {String} output
* @param {Function} fn
* @param {Boolean} [sync=false]
*/

Renderer.prototype.register = function(name, output, fn, sync){
  if (!name) throw new ExtendError('name is required');
  if (!output) throw new ExtendError('output is required');
  if (typeof fn !== 'function') throw new ExtendError('fn is required');

  name = name.replace(/^\./, '');
  output = output.replace(/^\./, '');

  if (sync){
    this.storeSync[name] = fn;
    this.storeSync[name].output = output;

    this.store[name] = function(){
      var args = Array.prototype.slice.call(arguments),
        callback = args.pop(),
        d = domain.create(),
        called = false;

      d.on('error', function(err){
        !called && callback(err);
        called = true;
      });

      d.add(fn);

      d.run(function(){
        !called && callback(null, fn.apply(null, args));
        called = true;
      });
    };
  } else {
    this.store[name] = fn;
  }

  this.store[name].output = output;
};

/**
* Gets extension name.
*
* @method getExtname
* @param {String} str
* @return {String}
* @private
*/

var getExtname = function(str){
  return (pathFn.extname(str) || str).replace(/^\./, '');
};

/**
* Gets the renderer plugin.
*
* @method get
* @param {String} name
* @param {Boolean} [sync=false]
*/

Renderer.prototype.get = function(name, sync){
  var store = this[sync ? 'storeSync' : 'store'];

  return store[getExtname(name)] || store[name];
};

/**
* Checks if the given `path` is renderable.
*
* @method isRenderable
* @param {String} path
* @return {Boolean}
*/

Renderer.prototype.isRenderable = function(path){
  return !!this.get(path);
};

/**
* Checks if the given `path` is renderable by synchronized renderer.
*
* @method isRenderableSync
* @param {String} path
* @return {Boolean}
*/

Renderer.prototype.isRenderableSync = function(path){
  return !!this.get(path, true);
};

/**
* Gets the output extension name.
*
* @method getOutput
* @param {String} path
* @return {String}
*/

Renderer.prototype.getOutput = function(path){
  var renderer = this.get(path);

  if (renderer) return renderer.output;
};