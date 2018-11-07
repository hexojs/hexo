'use strict';

const { dirname, extname, join } = require('path');
const assignIn = require('lodash/assignIn');
const omit = require('lodash/omit');
const yfm = require('hexo-front-matter');
const Promise = require('bluebird');

function View(path, data) {
  this.path = path;
  this.source = join(this._theme.base, 'layout', path);
  this.data = typeof data === 'string' ? yfm(data) : data;

  this._precompile();
}

View.prototype.render = function(options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = options || {};

  const { data } = this;
  const { layout = options.layout } = data;
  const locals = this._buildLocals(options);

  return this._compiled(this._bindHelpers(locals)).then(result => {
    if (result == null || !layout) return result;

    const layoutView = this._resolveLayout(layout);
    if (!layoutView) return result;

    const layoutLocals = Object.assign({}, locals, {
      body: result,
      layout: false
    });

    return layoutView.render(layoutLocals, callback);
  }).asCallback(callback);
};

View.prototype.renderSync = function(options = {}) {
  const { data } = this;
  const { layout = options.layout } = data;
  const locals = this._buildLocals(options);
  const result = this._compiledSync(this._bindHelpers(locals));

  if (result == null || !layout) return result;

  const layoutView = this._resolveLayout(layout);
  if (!layoutView) return result;

  const layoutLocals = Object.assign({}, locals, {
    body: result,
    layout: false
  });

  return layoutView.renderSync(layoutLocals);
};

View.prototype._buildLocals = function(locals) {
  return assignIn({}, locals, omit(this.data, ['layout', '_content']), {
    filename: this.source
  });
};

View.prototype._bindHelpers = function(locals) {
  const helpers = this._helper.list();
  const keys = Object.keys(helpers);

  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
    locals[key] = helpers[key].bind(locals);
  }

  return locals;
};

View.prototype._resolveLayout = function(name) {
  // Relative path
  const layoutPath = join(dirname(this.path), name);
  let layoutView = this._theme.getView(layoutPath);

  if (layoutView && layoutView.source !== this.source) return layoutView;

  // Absolute path
  layoutView = this._theme.getView(name);
  if (layoutView && layoutView.source !== this.source) return layoutView;
};

View.prototype._precompile = function() {
  const render = this._render;
  const ctx = render.context;
  const ext = extname(this.path);
  const renderer = render.getRenderer(ext);
  const data = {
    path: this.source,
    text: this.data._content
  };

  function buildFilterArguments(result) {
    const output = render.getOutput(ext) || ext;
    return [
      `after_render:${output}`,
      result,
      {
        context: ctx,
        args: [data]
      }
    ];
  }

  if (renderer && typeof renderer.compile === 'function') {
    const compiled = renderer.compile(data);

    this._compiledSync = locals => {
      const result = compiled(locals);
      return ctx.execFilterSync(...buildFilterArguments(result));
    };

    this._compiled = locals => Promise.resolve(compiled(locals))
      .then(result => ctx.execFilter(...buildFilterArguments(result)));
  } else {
    this._compiledSync = locals => render.renderSync(data, locals);

    this._compiled = locals => render.render(data, locals);
  }
};

module.exports = View;
