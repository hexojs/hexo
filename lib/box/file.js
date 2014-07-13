var fs = require('graceful-fs'),
  _ = require('lodash'),
  util = require('../util'),
  file = util.file2;

/**
* The file object of the Box class.
*
* @class File
* @param {Box} box
* @param {String} source The full path of the file.
* @param {String} path The relative path of the file.
* @param {String} type
* @param {Object} params
* @constructor
* @namespace Box
* @module hexo
*/
var File = module.exports = function File(box, source, path, type, params){
  this.box = box;
  this.source = source;
  this.path = path;
  this.type = type;
  this.params = params;
};

/**
* Reads the file.
*
* @method read
* @param {Object} [options]
* @param {Function} [callback]
* @async
*/
File.prototype.read = function(options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  file.readFile(this.source, options, callback);
};

/**
* Reads the file synchronizedly.
*
* @method read
* @param {Object} [options]
* @return {String}
*/
File.prototype.readSync = function(options){
  return file.readFileSync(this.source, options);
};

/**
* Gets the file status.
*
* @method stat
* @param {Function} callback
* @async
*/
File.prototype.stat = function(callback){
  fs.stat(this.source, callback);
};

/**
* Gets the file status synchronizedly.
*
* @method statSync
* @return {fs.Stats}
*/
File.prototype.statSync = function(){
  return fs.statSync(this.source);
};

/**
* Renders the file with renderers.
*
* @method render
* @param {Object} [options]
* @param {Function} [callback]
* @async
*/
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

/**
* Renders the file with renderers synchronizedly.
*
* @method renderSync
* @param {Object} [options]
* @return {String}
*/
File.prototype.renderSync = function(options){
  return hexo.render.renderSync({path: this.source}, options);
};