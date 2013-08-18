var EventEmitter = require('events').EventEmitter;

var Router = module.exports = function(){
  this.routes = {};
};

Router.prototype.__proto__ = EventEmitter.prototype;

var format = Router.prototype.format = function(str){
  if (str[0] === '/') str = str.substring(1);

  var last = str.substr(str.length - 1, 1);
  if (!last || last === '/') str += 'index.html';

  str = str.replace(/\\/g, '/');

  return str;
};

Router.prototype.get = function(source){
  return this.routes[format(source)];
};

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
};

Router.prototype.remove = function(source){
  source = format(source);

  delete this.routes[source];

  this.emit('remove', source);
};