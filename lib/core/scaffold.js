var pathFn = require('path'),
  fs = require('graceful-fs'),
  Box = require('../box'),
  util = require('../util'),
  file = util.file2,
  HexoError = require('../error');

var rHiddenFile = /\/_/;

var getScaffoldName = function(path){
  return path.substring(hexo.scaffold_dir.length, path.length - pathFn.extname(path).length);
};

var process = function(data, callback){
  if (data.path[0] === '_' || rHiddenFile.test(data.path)) return callback();

  var name = getScaffoldName(data.source);

  if (data.type === 'delete'){
    data.box.scaffolds[name] = null;
    return callback();
  }

  data.read(function(err, content){
    if (err) return callback(HexoError.wrap(err, 'Scaffold load failed: ' + data.path));

    data.box.scaffolds[name] = {
      path: data.source,
      content: content
    };

    callback();
  });
};

/**
* This module manages all files in the scaffold folder.
*
* @class Scaffold
* @constructor
* @module hexo
* @extend Box
*/
var Scaffold = module.exports = function Scaffold(){
  Box.call(this, hexo.scaffold_dir);

  /**
  * Asset folder.
  *
  * @property asset_dir
  * @type String
  */
  this.asset_dir = pathFn.join(hexo.core_dir, 'assets', 'scaffolds');

  /**
  * The scaffold collection.
  *
  * @property scaffolds
  * @type Object
  */
  this.scaffolds = {};

  /**
  * The default scaffold collection.
  *
  * @property defaults
  * @type Object
  */
  this.defaults = {
    normal: [
      'layout: {{ layout }}',
      'title: {{ title }}',
      'date: {{ date }}',
      'tags:',
      '---'
    ].join('\n') + '\n'
  };

  this.processors.push({process: process});
};

Scaffold.prototype.__proto__ = Box.prototype;

/**
* Gets a scaffold.
*
* @method get
* @param {String} layout
* @param {Function} callback
* @async
*/
Scaffold.prototype.get = function(layout, callback){
  if (this.scaffolds[layout] != null){
    return callback(null, this.scaffolds[layout].content);
  } else if (this.defaults[layout] != null){
    return callback(null, this.defaults[layout]);
  }

  var scaffoldPath = pathFn.join(this.asset_dir, layout + '.md'),
    self = this;

  fs.exists(scaffoldPath, function(exist){
    if (!exist) return callback();

    file.readFile(scaffoldPath, function(err, content){
      if (err) return callback(err);

      self.defaults[getScaffoldName(layout)] = content;

      callback(null, content);
    });
  });
};

/**
* Creates/updates a scaffold.
*
* @method set
* @param {String} layout
* @param {String} content
* @param {Function} [callback]
* @async
*/
Scaffold.prototype.set = function(layout, content, callback){
  if (typeof callback !== 'function') callback = function(){};

  var scaffoldPath = '',
    self = this;

  if (this.scaffolds[layout] != null){
    scaffoldPath = this.scaffolds[layout].path;
  } else {
    scaffoldPath = pathFn.join(hexo.scaffold_dir, layout);
    if (!pathFn.extname(scaffoldPath)) scaffoldPath += '.md';
  }

  file.writeFile(scaffoldPath, content, function(err){
    if (err) return callback(err);

    self.scaffolds[layout] = {
      path: scaffoldPath,
      content: content
    };

    callback();
  });
};

Scaffold.prototype.create = Scaffold.prototype.set;
Scaffold.prototype.update = Scaffold.prototype.set;

/**
* Removes a scaffold.
*
* @method remove
* @param {String} layout
* @param {Function} [callback]
* @async
*/
Scaffold.prototype.remove = function(layout, callback){
  if (typeof callback !== 'function') callback = function(){};
  if (this.scaffolds[layout] == null) return callback();

  fs.unlink(this.scaffolds[layout].path, callback);
};