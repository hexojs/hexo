var pathFn = require('path');
var _ = require('lodash');
var yfm = require('hexo-front-matter');

function View(path, data){
  var ctx = this.context;

  this.path = path;
  this.source = pathFn.join(this.theme.base, path);
  this.extname = pathFn.extname(path);
  this.render = ctx.render;
  this.helper = ctx.extend.helper;
  this.data = typeof data === 'string' ? yfm(data) : data;
}

View.prototype.render = function(options, callback){
  if (!callback && typeof options === 'function'){
    callback = options;
    options = {};
  }

  options = options || {};

  var data = this.data;
  var layout = data.hasOwnProperty('layout') ? data.layout : options.layout;
  var locals = this._buildLocals(options);
  var self = this;

  return this.render.render({
    path: this.source,
    text: data._content
  }, this._bindHelpers(locals)).then(function(result){
    if (!layout) return result;

    var layoutView = self._resolveLayout(layout);
    if (!layoutView) return result;

    var layoutLocals = _.clone(locals);
    layoutLocals.body = result;
    layoutLocals.layout = false;

    return layoutView.render(layoutLocals, callback);
  }).nodeify(callback);
};

View.prototype.renderSync = function(options){
  options = options || {};

  var data = this.data;
  var layout = data.hasOwnProperty('layout') ? data.layout : options.layout;
  var locals = this._buildLocals(options);

  var result = this.render.renderSync({
    path: this.source,
    text: data._content
  }, this._bindHelpers(locals));

  if (result == null || !layout) return result;

  var layoutView = this._resolveLayout(layout);
  if (!layoutView) return result;

  var layoutLocals = _.clone(locals);
  layoutLocals.body = result;
  layoutLocals.layout = false;

  return layoutView.renderSync(layoutLocals);
};

View.prototype._buildLocals = function(locals){
  var data = this.data;
  var result = {};
  var keys = [];
  var key = '';
  var i, len;

  // Assign locals
  keys = Object.keys(locals);

  for (i = 0, len = keys.length; i < len; i++){
    key = keys[i];
    result[key] = locals[key];
  }

  // Bind view data
  keys = Object.keys(data);

  for (i = 0, len = keys.length; i < len; i++){
    key = keys[i];
    if (key !== 'layout' && key !== '_content') result[key] = data[key];
  }

  // Bind view source
  result.filename = this.source;

  return result;
};

View.prototype._bindHelpers = function(locals){
  var helpers = this.helper.list();
  var keys = Object.keys(helpers);
  var result = {};
  var key = '';

  for (var i = 0, len = keys.length; i < len; i++){
    key = keys[i];
    result[key] = helpers[key].bind(result);
  }

  _.extend(result, locals);

  return result;
};

View.prototype._resolveLayout = function(name){
  // Relative path
  var layoutPath = pathFn.join(pathFn.dirname(this.path), name);
  var layoutView = this.theme.getView(layoutPath);

  if (layoutView && layoutView.source !== this.source) return layoutView;

  // Absolute path
  layoutView = this.theme.getView(name);
  if (layoutView && layoutView.source !== this.source) return layoutView;
};

module.exports = View;