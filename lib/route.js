var EventEmitter = require('events').EventEmitter,
  path = require('path'),
  _ = require('underscore'),
  store = {},
  Route = new EventEmitter();

var format = Route.format = function(str){
  if (str.substr(0, 1) === '/') str = str.substring(1);

  var last = str.substr(str.length - 1, 1);
  if (!last || last === '/') str += 'index.html';

  return str;
};

Route.get = function(source){
  return store[format(source)];
};

Route.set = function(source, callback){
  source = format(source);

  if (_.isFunction(callback)){
    store[source] = callback;
  } else {
    store[source] = function(fn){
      fn(null, callback, source);
    };
  }
};

Route.destroy = function(source){
  source = format(source);
  delete store[source];
};

Route.list = function(){
  return store;
};

Route.clear = function(){
  store = {};
};

module.exports = Route;