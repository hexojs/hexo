var EventEmitter = require('events').EventEmitter;

var Router = module.exports = function(){
  this.routes = {};
};

var format = Router.prototype.format = function(str){
  if (str.substr[0] === '/') str = str.substring(1);

  var last = str.substr(str.length - 1, 1);
  if (!last || last === '/') str += 'index.html';

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
      fn(null, callback, source);
    };
  }

  if (_callback.modified == null) _callback.modified = true;

  var route = this._routes[source] = _callback;

  this.emit('update', source, route);
};

Router.prototype.remove = function(source){
  source = format(source);

  delete this._routes[source];

  this.emit('remove', source);
};

Router.prototype.__proto__ = EventEmitter.prototype;