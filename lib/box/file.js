var Promise = require('bluebird');
var util = require('../util');
var fs = util.fs;

function File(data){
  this.source = data.source;
  this.path = data.path;
  this.type = data.type;
  this.params = data.params;

  if (this._context){
    this._render = this._context.render;
  }
}

File.prototype.read = function(options, callback){
  if (!callback && typeof options === 'function'){
    callback = options;
    options = {};
  }

  return fs.readFile(this.source, options).nodeify(callback);
};

File.prototype.readSync = function(options){
  return fs.readFileSync(this.source, options);
};

File.prototype.stat = function(callback){
  return fs.stat(this.source).nodeify(callback);
};

File.prototype.statSync = function(){
  return fs.statSync(this.source);
};

File.prototype.render = function(options, callback){
  if (!callback && typeof options === 'function'){
    callback = options;
    options = {};
  }

  return this._render.render({path: this.source}, options).nodeify(callback);
};

File.prototype.renderSync = function(options){
  return this._render.renderSync({path: this.source}, options);
};

module.exports = File;