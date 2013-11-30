var ExtendError = require('../error').ExtendError,
  pathFn = require('path');

var Renderer = module.exports = function(){
  this.store = {};
  this.storeSync = {};
};

Renderer.prototype.list = function(sync){
  return sync ? this.storeSync : this.store;
};

Renderer.prototype.register = function(name, output, fn, sync){
  if (typeof fn !== 'function'){
    throw new ExtendError('Renderer function is not defined');
  }

  name = name.replace(/^\./, '');

  if (sync){
    this.storeSync[name] = fn;
    this.storeSync[name].output = output;

    this.store[name] = function(){
      var args = Array.prototype.slice.call(arguments),
        callback = args.pop();

      try {
        callback(null, fn.apply(null, args));
      } catch (err){
        callback(err);
      }
    };
  } else {
    this.store[name] = fn;
  }

  this.store[name].output = output;
};

var getExtname = function(str){
  return (pathFn.extname(str) || str).replace(/^\./, '');
};

Renderer.prototype.get = function(name, sync){
  var store = this[sync ? 'storeSync' : 'store'];

  return store[getExtname(name)] || store[name];
};

Renderer.prototype.isRenderable = function(path){
  return !!this.get(path);
};

Renderer.prototype.isRenderableSync = function(path){
  return !!this.get(path, true);
};

Renderer.prototype.getOutput = function(path){
  var renderer = this.get(path);

  if (renderer) return renderer.output;
};