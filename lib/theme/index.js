var pathFn = require('path'),
  _ = require('lodash'),
  async = require('async'),
  Box = require('../box'),
  i18n = require('../core/i18n');

/**
* This module manages all files in the theme folder.
*
* @class Theme
* @constructor
* @module hexo
* @extend Box
*/

var Theme = module.exports = function Theme(){
  Box.call(this, hexo.theme_dir);

  /**
  * Theme configuration.
  *
  * @property config
  * @type Object
  */
  this.config = {};

  /**
  * The i18n instance of the theme.
  *
  * @property i18n
  * @type i18n
  */
  this.i18n = new i18n({
    code: hexo.config.language
  });

  /**
  * The view collection of the theme.
  *
  * @property views
  * @type Object
  */
  this.views = {};

  this.processors = [
    require('./processors/config'),
    require('./processors/i18n'),
    require('./processors/view'),
    require('./processors/source')
  ];
};

Theme.prototype.__proto__ = Box.prototype;

Theme.prototype.load = Box.prototype.process;

/**
* Runs generators.
*
* @method generate
* @param {Object} [options]
*   @param {Boolean} [options.watch=false]
* @param {Function} [callback]
* @async
*/
Theme.prototype.generate = function(options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  options = _.extend({
    watch: false
  }, options);

  var model = hexo.model,
    config = hexo.config,
    route = hexo.route,
    siteLocals = hexo.locals._generate(),
    themeLocals = _.extend({}, config, this.config),
    env = hexo.env,
    i18n = this.i18n,
    layoutDir = pathFn.join(this.base, 'layout') + pathFn.sep,
    self = this;

  hexo._themeConfig = themeLocals;

  var Locals = function(path, locals){
    this.page = _.extend({path: path}, locals);
    this.path = path;
    this.url = config.url + config.root + path;
    this.site = siteLocals;
    this.config = config;
    this.theme = themeLocals;
    this._ = _;
    this.__ = i18n.__();
    this._p = i18n._p();
    this.layout = 'layout';
    this.cache = !options.watch;
    this.env = hexo.env;
    this.view_dir = layoutDir;
  };

  async.each(hexo.extend.generator.list(), function(generator, next){
    generator(siteLocals, function(path, layouts, locals){
      if (!Array.isArray(layouts)) layouts = [layouts];

      layouts = _.uniq(layouts);

      var newLocals = new Locals(path, locals);

      route.set(path, function(fn){
        var view;

        for (var i = 0, len = layouts.length; i < len; i++){
          view = self.getView(layouts[i]);
          if (view) break;
        }

        if (view){
          hexo.log.d('Render %s: %s', layouts[i], path);
          view.render(newLocals, fn);
        } else {
          hexo.log.w('No layout: %s', path);
          fn();
        }
      });
    }, next);
  }, callback);
};

/**
* Gets a view.
*
* @method getView
* @param {String} path
* @return {Theme.View}
*/
Theme.prototype.getView = function(path){
  // Replace backslashes on Windows
  path = path.replace(/\\/g, '/');

  var extname = pathFn.extname(path),
    name = path.substring(0, path.length - extname.length),
    views = this.views[path];

  if (!views) return;

  if (extname){
    return views[extname];
  } else {
    return views[Object.keys(views)[0]];
  }
};