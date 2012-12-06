var EventEmitter = require('events').EventEmitter,
  route = new EventEmitter(),
  store = {};

route.list = function(){
  return store;
};

route.get = function(name){
  return store[name];
};

route.set = function(name, content){
  store[name] = content;
  route.emit('change', name, content);
};

module.exports = route;