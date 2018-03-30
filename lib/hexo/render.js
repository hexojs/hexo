'use strict';

const { extname } = require('path');
const Promise = require('bluebird');
const fs = require('hexo-fs');

function getExtname(str) {
  if (typeof str !== 'string') return '';

  const ext = extname(str);
  return ext[0] === '.' ? ext.slice(1) : ext;
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
  if (callback == null && typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (!data) {
    return Promise.reject(new TypeError('No input file or string!')).asCallback(callback);
  }

  let promise;

  if (data.text != null) {
    promise = Promise.resolve(data.text);
  } else if (data.path) {
    promise = fs.readFile(data.path);
  } else {
    return Promise.reject(new TypeError('No input file or string!')).asCallback(callback);
  }

  const ctx = this.context;
  const ext = data.engine || getExtname(data.path);

  return promise.then(text => {
    data.text = text;
    if (!ext || !this.isRenderable(ext)) return text;

    const renderer = this.getRenderer(ext);
    return renderer.call(ctx, data, options);
  }).then(result => {
    result = toString(result, data);
    if (data.onRenderEnd) {
      return data.onRenderEnd(result);
    }

    return result;
  }).then(result => {
    const output = this.getOutput(ext) || ext;
    return ctx.execFilter(`after_render:${output}`, result, {
      context: ctx,
      args: [data]
    });
  }).asCallback(callback);
};

Render.prototype.renderSync = function(data, options = {}) {
  if (!data) throw new TypeError('No input file or string!');

  const ctx = this.context;

  if (data.text == null) {
    if (!data.path) throw new TypeError('No input file or string!');
    data.text = fs.readFileSync(data.path);
    if (data.text == null) throw new TypeError('No input file or string!');
  }


  const ext = data.engine || getExtname(data.path);
  let result;

  if (ext && this.isRenderableSync(ext)) {
    const renderer = this.getRendererSync(ext);
    result = renderer.call(ctx, data, options);
  } else {
    result = data.text;
  }

  const output = this.getOutput(ext) || ext;
  result = toString(result, data);

  if (data.onRenderEnd) {
    result = data.onRenderEnd(result);
  }

  return ctx.execFilterSync(`after_render:${output}`, result, {
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
