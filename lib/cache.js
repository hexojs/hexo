var util = require('./util'),
  file = util.file,
  fs = require('graceful-fs'),
  _ = require('underscore'),
  store = {},
  cachePath;

exports.init = function(root, callback){
  cachePath = root + '/.cache';
  fs.exists(cachePath, function(exist){
    if (exist){
      file.read(cachePath, function(err, content){
        try {
          store = JSON.parse(content);
        } finally {
          callback();
        }
      });
    } else {
      callback();
    }
  });
};

exports.list = function(){
  return store;
}

exports.get = function(key){
  return store[key];
};

exports.set = function(key, val, callback){
  if (!_.isFunction(callback)) callback = function(){};
  store[key] = val;
  file.write(cachePath, JSON.stringify(store), callback);
};

exports.destroy = function(key, callback){
  if (!_.isFunction(callback)) callback = function(){};
  delete store[key];
  file.write(cachePath, JSON.stringify(store), callback);
};