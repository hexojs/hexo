var pathFn = require('path');
var Promise = require('bluebird');
var util = require('../util');
var fs = util.fs;

function getExtname(str){
  var extname = pathFn.extname(str);
  return extname[0] === '.' ? extname.slice(1) : extname;
}

function Render(ctx){
  this.renderer = ctx.extend.renderer;
}

Render.prototype.isRenderable = function(path){
  return this.renderer.isRenderable(path);
};

Render.prototype.isRenderableSync = function(path){
  return this.renderer.isRenderableSync(path);
};

Render.prototype.getOutput = function(path){
  return this.renderer.getOutput(path);
};

Render.prototype.render = function(data, options, callback){
  if (!callback && typeof options === 'function'){
    callback = options;
    options = {};
  }

  var self = this;

  return new Promise(function(resolve, reject){
    if (!data) return reject(new TypeError('No input file or string!'));
    if (data.text != null) return resolve(data.text);
    if (!data.path) return reject(new TypeError('No input file or string!'));

    return fs.readFile(data.path).then(resolve, reject);
  }).then(function(text){
    var ext = data.engine || getExtname(data.path);
    if (!ext || !self.isRenderable(ext)) return text;

    var renderer = self.renderer.get(ext);
    return renderer({path: data.path, text: text}, options);
  }).nodeify(callback);
};

Render.prototype.renderSync = function(data, options){
  if (!data) throw new TypeError('No input file or string!');

  var text = '';

  if (data.text != null){
    text = data.text;
  } else if (data.path){
    text = fs.readFileSync(data.path);
  }

  if (text == null) throw new TypeError('No input file or string!');

  var ext = data.engine || getExtname(data.path);
  if (!ext || !this.isRenderableSync(ext)) return text;

  var renderer = this.renderer.get(ext, true);
  return renderer({path: data.path, text: text}, options);
};

module.exports = Render;