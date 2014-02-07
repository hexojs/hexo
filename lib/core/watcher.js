var util = require('../util'),
  file = util.file2,
  pathRegex = util.pathRegex,
  format = pathRegex.format,
  parse = pathRegex.parse;

var Watcher = module.exports = function(base){
  this.base = base;
  this.listeners = {};
};

Watcher.prototype.init = function(){
  var self = this;

  file.watch(this.base, function(type, src, stats){
    self.emit(type, src, stats);
  });

  return this;
};

Watcher.prototype.start = function(){
  //
};

Watcher.prototype.stop = function(){
  //
};

Watcher.prototype.emit = function(type, src, stats){
  return this;
};

Watcher.prototype.on = Watcher.prototype.bind = Watcher.prototype.addListener = function(rule, fn){
  if (!this.listeners.hasOwnProperty(rule)) this.listeners[rule] = [];

  this.listeners[rule].push(format(rule, fn));

  return this;
};

Watcher.prototype.off = Watcher.prototype.unbind = Watcher.prototype.removeListener = function(rule, fn){
  if (this.listeners.hasOwnProperty(rule)){
    var arr = this.listeners[rule];

    if (fn){
      for (var i = 0, len = arr.length; i < len; i++){
        if (arr[i] === fn){
          arr.splice(i, 1);
          i--;
          len--;
        }
      }
    } else {
      arr.length = 0;
    }
  }

  return this;
};

Watcher.prototype.once = Watcher.prototype.one = function(rule, fn){
  var self = this,
    fired = false;

  var listener = function(){
    self.off(rule, listener);

    if (!fired){
      fired = true;
      listener.apply(self, arguments);
    }
  };

  this.on(rule, listener);

  return this;
};