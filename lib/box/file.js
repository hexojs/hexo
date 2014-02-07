var fs = require('graceful-fs'),
  _ = require('lodash'),
  util = require('../util'),
  file = util.file2;

var File = module.exports = function File(box, source, path, type, params){
  this.box = box;
  this.source = source;
  this.path = path;
  this.type = type;
  this.params = params;
};

File.prototype.read = function(options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  var options = _.extend({
    cache: false
  }, options);
/*
  if (options.cache){
    //
  } else {
    file.readFile(this.source, callback);
  }*/
  file.readFile(this.source, callback);
};

File.prototype.stat = function(callback){
  fs.stat(this.source, callback);
};

File.prototype.render = function(options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  hexo.render.render({path: this.source}, options, callback);
};

File.prototype.renderSync = function(options){
  return hexo.render.renderSync({path: this.source}, options);
};