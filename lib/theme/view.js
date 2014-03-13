var async = require('async'),
  pathFn = require('path'),
  _ = require('lodash');

/**
* The view object of the Theme class.
*
* @class View
* @param {String} source The full source of the view file.
* @param {String} path The relative path of the view file.
* @param {Theme} theme
* @constructor
* @namespace Theme
* @module hexo
*/
var View = module.exports = function View(source, path, theme){
  /**
  * The full path of the view file.
  *
  * @property source
  * @type {String}
  */
  this.source = source;

  /**
  * The relative path of the view file.
  *
  * @property path
  * @type {String}
  */
  this.path = path;

  /**
  * The extension name of the view file. (With a prefixed dot)
  *
  * @property extname
  * @type {String}
  */
  this.extname = pathFn.extname(path);

  /**
  * The theme object.
  *
  * @property theme
  * @type {Theme}
  */
  this.theme = theme;

  /**
  * View data.
  *
  * @property data
  * @type {Object}
  */
  this.data = null;

  /**
  * View cache.
  *
  * @property cache
  * @type {Object}
  * @private
  */
  this.cache = null;
};

/**
* Renders the view.
*
* @method render
* @param {Object} [options]
*   @param {Boolean} [options.cache=true]
* @param {Function} callback
*/
View.prototype.render = function(options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  options = _.extend({
    cache: true
  }, options);

  var data = this.data;
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

/**
* Resolves the layout path.
*
* @method _resolveLayout
* @param {String} name
* @return {View}
* @private
*/
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

/**
* Clones the object and binds the helper functions.
*
* @method _buildLocals
* @param {Object} locals
* @return {Object}
* @private
*/
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

/**
* Renders the view synchronizedly.
*
* @method renderSync
* @param {Object} [options]
*   @param {Boolean} [options.cache=true]
* @return {String}
*/
View.prototype.renderSync = function(options){
  options = _.extend({
    cache: true
  }, options);

  var data = this.data;
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

/**
* Invalidates the cache.
*
* @method invalidate
*/
View.prototype.invalidate = function(){
  this.cache = null;
};