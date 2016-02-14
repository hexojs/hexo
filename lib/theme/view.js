'use strict';

var pathFn = require('path');
var _ = require('lodash');
var yfm = require('hexo-front-matter');
var Promise = require('bluebird');

function View(path, data) {
  this.path = path;
  this.source = pathFn.join(this._theme.base, 'layout', path);
  this.data = typeof data === 'string' ? yfm(data) : data;

  this._precompile();
}

View.prototype.render = function(options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = options || {};

  var data = this.data;
  var layout = data.hasOwnProperty('layout') ? data.layout : options.layout;
  var locals = this._buildLocals(options);
  var self = this;

  return this._compiled(this._bindHelpers(locals)).then(function(result) {
    if (result == null || !layout) return result;

    var layoutView = self._resolveLayout(layout);
    if (!layoutView) return result;

    var layoutLocals = _.assign({}, locals, {
      body: result,
      layout: false
    });

    return layoutView.render(layoutLocals, callback);
  }).asCallback(callback);
};

View.prototype.renderSync = function(options) {
  options = options || {};

  var data = this.data;
  var layout = data.hasOwnProperty('layout') ? data.layout : options.layout;
  var locals = this._buildLocals(options);
  var result = this._compiledSync(this._bindHelpers(locals));

  if (result == null || !layout) return result;

  var layoutView = this._resolveLayout(layout);
  if (!layoutView) return result;

  var layoutLocals = _.assign({}, locals, {
    body: result,
    layout: false
  });

  return layoutView.renderSync(layoutLocals);
};

View.prototype._buildLocals = function(locals) {
  return _.assignIn({}, locals, _.omit(this.data, ['layout', '_content']), {
    filename: this.source
  });
};

View.prototype._bindHelpers = function(locals) {
  var helpers = this._helper.list();
  var keys = Object.keys(helpers);
  var key = '';

  for (var i = 0, len = keys.length; i < len; i++) {
    key = keys[i];
    locals[key] = _.bind(helpers[key], locals);
  }

  return locals;
};

View.prototype._resolveLayout = function(name) {
  // Relative path
  var layoutPath = pathFn.join(pathFn.dirname(this.path), name);
  var layoutView = this._theme.getView(layoutPath);

  if (layoutView && layoutView.source !== this.source) return layoutView;

  // Absolute path
  layoutView = this._theme.getView(name);
  if (layoutView && layoutView.source !== this.source) return layoutView;
};

View.prototype._precompile = function() {
  var render = this._render;
  var renderer = render.getRenderer(pathFn.extname(this.path));
  var data = {
    path: this.source,
    text: this.data._content
  };

  if (typeof renderer.compile === 'function') {
    var compiled = this._compiledSync = renderer.compile(data);
    this._compiled = Promise.method(compiled);
  } else {
    this._compiledSync = function(locals) {
      return render.renderSync(data, locals);
    };

    this._compiled = function(locals) {
      return render.render(data, locals);
    };
  }
};

module.exports = View;
