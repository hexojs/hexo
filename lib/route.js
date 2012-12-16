var path = require('path'),
  _ = require('underscore'),
  store = {};

exports.get = function(source){
  if (!path.extname(source)){
    source += (source.substr(source.length - 1, 1) === '/' ? '/' : '') + 'index.html';
  }

  return store[source];
};

exports.set = function(source, callback){
  if (!path.extname(source)){
    source += (source.substr(source.length - 1, 1) === '/' ? '' : '/') + 'index.html';
  }

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