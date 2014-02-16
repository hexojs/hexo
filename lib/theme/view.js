var async = require('async'),
  pathFn = require('path'),
  _ = require('lodash'),
  util = require('../util'),
  file = util.file2,
  yfm = util.yfm;

var View = module.exports = function View(source, path, theme){
  this.source = source;
  this.path = path;
  this.extname = pathFn.extname(path);
  this.theme = theme;
  this.data = null;
};

View.prototype._getData = function(){
  this.data = this.data || yfm(file.readFileSync(this.source));

  return this.data;
};

View.prototype.render = function(options, callback){
  if (!options.cache) this.invalidate();

  var data = this._getData();
  if (!data) return callback();

  var layout = data.hasOwnProperty('layout') ? data.layout : options.layout,
    locals = _.extend(this._buildLocals(options), _.omit(data, 'layout', '_content'), {filename: this.source}),
    self = this;

  hexo.render.render({
    path: this.source,
    text: data._content
  }, locals, function(err, result){
    if (err) return callback(err);
    if (!layout) return callback(null, result);

    var layoutView = self._resolveLayout(layout);

    if (layoutView){
      var layoutLocals = _.extend({}, locals, {body: result, layout: false});

      layoutView.render(layoutLocals, callback);
    } else {
      callback(null, result);
    }
  });
};

View.prototype._resolveLayout = function(name){
  // Relative path
  var layoutView = this.theme.getView(pathFn.join(pathFn.dirname(this.path), name));

  if (layoutView && layoutView.source === this.source) layoutView = null;

  // Absolute path
  if (!layoutView){
    layoutView = this.theme.getView(name);

    if (layoutView && layoutView.source === this.source) layoutView = null;
  }

  return layoutView;
};

View.prototype._buildLocals = function(locals){
  var helpers = hexo.extend.helper.list(),
    obj = {};

  _.each(helpers, function(helper, name){
    obj[name] = helper.bind(obj);
  });

  _.each(locals, function(fn, name){
    if (!helpers.hasOwnProperty(name) || helpers[name].toString() === fn.toString()){
      obj[name] = fn;
    }
  });

  return obj;
};

View.prototype.renderSync = function(options){
  if (!options.cache) this.invalidate();

  var data = this._getData();
  if (!data) return;

  var layout = data.hasOwnProperty('layout') ? data.layout : options.layout,
    locals = _.extend(this._buildLocals(options), _.omit(data, 'layout', '_content'), {filename: this.source});

  var result = hexo.render.renderSync({
    path: this.source,
    text: data._content
  }, locals);

  if (!result) return;
  if (!layout) return result;

  var layoutView = this._resolveLayout(layout);

  if (layoutView){
    var layoutLocals = _.extend({}, locals, {body: result, layout: false});

    return layoutView.renderSync(layoutLocals);
  } else {
    return result;
  }
};

View.prototype.invalidate = function(){
  this.data = null;
};