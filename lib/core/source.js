var async = require('async'),
  pathFn = require('path'),
  Box = require('../box'),
  util = require('../util'),
  file = util.file2;

/**
* This module manages all files in the source folder.
*
* @class Source
* @constructor
* @module hexo
* @extend Box
*/

var Source = module.exports = function Source(){
  var base = hexo.source_dir;

  Box.call(this, base);
};

Source.prototype.__proto__ = Box.prototype;

/**
* Loads all files and runs processors.
*
* @method process
* @param {Array|String} [files] Files to be processed
* @param {Function} [callback]
*/
Source.prototype.load = Source.prototype.process = function(){
  this.processors = hexo.extend.processor.list();
  Box.prototype.process.apply(this, arguments);
};