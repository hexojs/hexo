'use strict';

var pathFn = require('path');
var Promise = require('bluebird');
var fs = require('hexo-fs');

function getExtname(str) {
  if (typeof str !== 'string') return '';

  var extname = pathFn.extname(str);
  return extname[0] === '.' ? extname.slice(1) : extname;
}

function Render(ctx) {
  this.context = ctx;
  this.renderer = ctx.extend.renderer;
}

Render.prototype.isRenderable = function(path) {
  return this.renderer.isRenderable(path);
};

Render.prototype.isRenderableSync = function(path) {
  return this.renderer.isRenderableSync(path);
};

Render.prototype.getOutput = function(path) {
  return this.renderer.getOutput(path);
};

Render.prototype.getRenderer = function(ext, sync) {
  return this.renderer.get(ext, sync);
};

Render.prototype.getRendererSync = function(ext) {
  return this.getRenderer(ext, true);
};

Render.prototype.render = function(data, options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  var ctx = this.context;
  var self = this;
  var ext = '';

  return new Promise(function(resolve, reject) {
    if (!data) return reject(new TypeError('No input file or string!'));
    if (data.text != null) return resolve(data.text);
    if (!data.path) return reject(new TypeError('No input file or string!'));

    fs.readFile(data.path).then(resolve, reject);
  }).then(function(text) {
    data.text = text;
    ext = data.engine || getExtname(data.path);
    if (!ext || !self.isRenderable(ext)) return text;

    var renderer = self.getRenderer(ext);
    return renderer.call(ctx, data, options);
  }).then(function(result) {
    result = toString(result, data);
    if (data.onRenderEnd) {
      return data.onRenderEnd(result);
    }

    return result;
  }).then(function(result) {
    var output = self.getOutput(ext) || ext;
    return ctx.execFilter('after_render:' + output, result, {
      context: ctx,
      args: [data]
    });
  }).asCallback(callback);
};

Render.prototype.renderSync = function(data, options) {
  if (!data) throw new TypeError('No input file or string!');

  options = options || {};

  var ctx = this.context;

  if (data.text == null) {
    if (!data.path) throw new TypeError('No input file or string!');
    data.text = fs.readFileSync(data.path);
  }

  if (data.text == null) throw new TypeError('No input file or string!');

  var ext = data.engine || getExtname(data.path);
  var result;

  if (ext && this.isRenderableSync(ext)) {
    var renderer = this.getRendererSync(ext);
    result = renderer.call(ctx, data, options);
  } else {
    result = data.text;
  }

  var output = this.getOutput(ext) || ext;
  result = toString(result, data);

  if (data.onRenderEnd) {
    result = data.onRenderEnd(result);
  }

  return ctx.execFilterSync('after_render:' + output, result, {
    context: ctx,
    args: [data]
  });
};

function toString(result, options) {
  if (!options.hasOwnProperty('toString') || typeof result === 'string') return result;

  if (typeof options.toString === 'function') {
    return options.toString(result);
  } else if (typeof result === 'object') {
    return JSON.stringify(result);
  } else if (result.toString) {
    return result.toString();
  }

  return result;
}

module.exports = Render;
