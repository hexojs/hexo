var path = require('path'),
  _ = require('underscore'),
  store = {};

var format = function(str){
  if (str.substr(0, 1) === '/') str = str.substring(1);

  var last = str.substr(str.length - 1, 1);
  if (!last || last === '/') str += 'index.html';

  return str;
};

exports.get = function(source){
  return store[format(source)];
};

exports.set = function(source, callback){
  source = format(source);

  if (_.isFunction(callback)){
    store[source] = callback;
  } else {
    store[source] = function(func){
      func(null, callback);
    };
  }
};

exports.list = function(){
  return store;
};