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

  console.log(Object.create(hexo.extend.helper.list()));
};

var mix = function(){
  var args = _.toArray(arguments),
    obj = {};

  for (var i = 0, len = args.length; i < len; i++){
    for (var j in args[i]){
      if (args[i].hasOwnProperty(j)){
        obj[j] = args[i][j];
      }
    }
  }

  return obj;
}

View.prototype._getData = function(){
  this.data = this.data || yfm(file.readFileSync(this.source));

  return this.data;
};

View.prototype.render = function(options, callback){
  if (!options.cache) this.invalidate();

  var data = this._getData();

  if (!data) return callback();

  var helper = hexo.extend.helper.list(),
    layout = data.hasOwnProperty('layout') ? data.layout : options.layout,
    locals = _.extend({}, helper, options, _.omit(data, 'layout', '_content')),
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

View.prototype.renderSync = function(options){
  if (!options.cache) this.invalidate();

  var data = this._getData();

  if (!data) return;

  var helper = hexo.extend.helper.list(),
    layout = data.hasOwnProperty('layout') ? data.layout : options.layout,
    locals = _.extend({}, helper, options, _.omit(data, 'layout', '_content'));

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