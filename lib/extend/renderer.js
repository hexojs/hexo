var ExtendError = require('../error').ExtendError;

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