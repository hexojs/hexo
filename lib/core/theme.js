/**
* Theme functions.
*
* @class theme
* @since 2.4.0
* @module hexo
* @namespace Hexo
* @static
*/

var async = require('async'),
  fs = require('graceful-fs'),
  pathFn = require('path'),
  chokidar = require('chokidar'),
  _ = require('lodash'),
  i18n = require('./i18n'),
  HexoError = require('../error'),
  util = require('../util'),
  file = util.file2;

var rHiddenFile = /^_|\/_|[~%]$/;

var themeConfig = {},
  themeLayout = {},
  themei18n = new i18n(),
  isRunning = false,
  isReady = false;

/**
* Gets the path of theme layout directory.
*
* @method _layoutDir
* @return {String}
* @private
*/

var _layoutDir = function(){
  return pathFn.join(hexo.theme_dir, 'layout') + pathFn.sep;
};

/**
* Gets the path of theme source directory.
*
* @method _sourceDir
* @return {String}
* @private
*/

var _sourceDir = function(){
  return pathFn.join(hexo.theme_dir, 'source') + pathFn.sep;
};

/**
* Gets the path of theme language directory.
*
* @method _languageDir
* @return {String}
* @private
*/

var _languageDir = function(){
  return pathFn.join(hexo.theme_dir, 'languages') + pathFn.sep;
};

/**
* Loads theme configuration.
*
* @method _loadConfig
* @param {Function} [callback]
* @private
* @async
*/

var _loadConfig = function(callback){
  if (typeof callback !== 'function') callback = function(){};

  var configPath = pathFn.join(hexo.theme_dir, '_config.yml');

  fs.exists(configPath, function(exist){
    if (!exist) return callback();

    hexo.render.render({path: configPath}, function(err, result){
      if (err) return callback(HexoError.wrap(err, 'Theme configuration load failed'));

      themeConfig = result;

      hexo.log.d('Theme configuration loaded');
      callback();
    });
  });
};

/**
* Loads theme layouts.
*
* @method _loadLayout
* @param {Function} [callback]
* @private
* @async
*/

var _loadLayout = function(callback){
  if (typeof callback !== 'function') callback = function(){};

  var layoutDir = _layoutDir();

  fs.exists(layoutDir, function(exist){
    if (!exist) return callback();

    file.list(layoutDir, {ignorePattern: rHiddenFile}, function(err, files){
      if (err) return callback(HexoError.wrap(err, 'Theme layout load failed'));

      files.forEach(function(item){
        var extname = pathFn.extname(item),
          name = item.substring(0, item.length - extname.length);

        themeLayout[name] = extname;
      });

      hexo.log.d('Theme layout loaded');
      callback();
    });
  });
};

/**
* Processes theme source files.
*
* @method _processSource
* @param {String} src
* @param {Function} [callback]
* @private
* @async
*/

var _processSource = function(src, callback){
  if (typeof callback !== 'function') callback = function(){};

  var source = pathFn.join(_sourceDir(), src),
    Asset = hexo.model('Asset');

  Asset.updateStat(source.substring(hexo.base_dir.length), function(err, asset){
    if (err) return callback(HexoError.wrap(err, 'Theme source load failed: ' + src));

    asset.path = src;
    asset.save();

    callback();
  });
};

/**
* Loads theme source files.
*
* @method _loadSource
* @param {Function} [callback]
* @private
* @async
*/

var _loadSource = function(callback){
  if (typeof callback !== 'function') callback = function(){};

  var sourceDir = _sourceDir();

  fs.exists(sourceDir, function(exist){
    if (!exist) return callback();

    file.list(sourceDir, {ignorePattern: rHiddenFile}, function(err, files){
      if (err) return callback(HexoError.wrap(err, 'Theme source load failed'));

      async.each(files, function(item, next){
        _processSource(item, next);
      }, function(err){
        if (err) return callback(err);

        hexo.log.d('Theme source loaded');
        callback();
      });
    });
  });
};

/**
* Loads theme language files.
*
* @method _loadi18n
* @param {Function} [callback]
* @private
* @async
*/

var _loadi18n = function(callback){
  if (typeof callback !== 'function') callback = function(){};

  var langDir = _languageDir();

  fs.exists(langDir, function(exist){
    if (!exist) return callback();

    themei18n.load(langDir, function(err){
      if (err) return callback(HexoError.wrap(err, 'Theme language files load failed'));

      hexo.log.d('Theme language files loaded');
      callback();
    })
  });
};

/**
* Loads the theme.
*
* @method load
* @param {Function} [callback]
* @async
* @static
*/

exports.load = function(callback){
  if (typeof callback !== 'function') callback = function(){};
  if (isRunning || isReady) return callback();

  isRunning = true;

  async.parallel([
    function(next){
      _loadConfig(next);
    },
    function(next){
      _loadLayout(next);
    },
    function(next){
      _loadSource(next);
    },
    function(next){
      _loadi18n(next);
    }
  ], function(err){
    isRunning = false;

    if (err) return callback(err);

    isReady = true;

    callback();
  });
};

/**
* Watches changes of theme configuration.
*
* @method _watchConfig
* @param {String} type
* @param {String} src
* @param {fs.Stats} stats
* @private
*/

var _watchConfig = function(type, src, stats){
  _loadConfig();
};

/**
* Watches changes of theme layouts.
*
* @method _watchLayout
* @param {String} type
* @param {String} src
* @param {fs.Stats} stats
* @private
*/

var _watchLayout = function(type, src, stats){
  var extname = pathFn.extname(src),
    name = src.substring(_layoutDir().length, src.length - extname.length);

  if (type === 'delete'){
    delete themeLayout[name];
  } else {
    themeLayout[name] = extname;
  }
};

/**
* Watches changes of theme source files.
*
* @method _watchSource
* @param {String} type
* @param {String} src
* @param {fs.Stats} stats
* @private
*/

var _watchSource = function(type, src, stats){
  var source = src.substring(_sourceDir().length),
    Asset = hexo.model('Asset');

  if (type === 'delete'){
    var data = Asset.findOne({
      source: src.substring(hexo.base_dir.length)
    });

    if (data) data.remove();
    route.remove(source);
    hexo.log.log('delete', 'Theme source: %s', source);
  } else {
    _processSource(source, function(err){
      if (err) return hexo.log.e(err);

      hexo.log.log(type, 'Theme source: %s', source);
    });
  }
};

/**
* Watches changes of theme language files.
*
* @method _watchi18n
* @param {String} type
* @param {String} src
* @param {fs.Stats} stats
* @private
*/

var _watchi18n = function(type, src, stats){
  // @TODO Watch changes of theme language files
};

/**
* Parses chokidar file type.
*
* @method _parseType
* @param {String} type
* @return {String}
* @private
*/

var _parseType = function(type){
  switch (type){
    case 'add':
      return 'create';

    case 'change':
      return 'update';

    case 'unlink':
      return 'delete';

    default:
      return type;
  }
};

/**
* Watches theme changes.
*
* @method watch
* @static
*/

exports.watch = function(){
  if (!isReady) return;

  var watcher = chokidar.watch(hexo.theme_dir, {
    ignored: rHiddenFile,
    persistent: true,
    ignoreInitial: true
  });

  watcher.on('all', function(type, src, stats){
    if (type === 'error'){
      hexo.log.e('Theme watch error: ' + src);
    }

    var _src = src.substring(hexo.theme_dir.length),
      _type = _parseType(type);

    if (_src === '_config.yml'){
      _watchConfig(_type, src, stats);
    } else if (/^layout\//.test(_src)){
      _watchLayout(_type, src, stats);
    } else if (/^source\//.test(_src)){
      _watchSource(_type, src, stats);
    } else if (/^languages\//.test(_src)){
      _watchi18n(_type, src, stats);
    }
  });
};

/**
* Resets theme cache.
*
* @method reset
* @static
*/

exports.reset = function(){
  themeConfig = {};
  themeLayout = {};
  themei18n = new i18n();
  isRunning = false;
  isReady = false;
};

/**
* Runs generators.
*
* @method generate
* @param {Object} [options]
* @param {Function} [callback]
* @async
* @static
*/

exports.generate = function(options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  var options = _.extend({
    watch: false
  }, options);

  var model = hexo.model,
    layoutDir = _layoutDir(),
    config = hexo.config,
    route = hexo.route,
    themeLocals = _.extend({}, config, themeConfig),
    env = hexo.env;

  var siteLocals = {
    posts: model('Post').populate('categories').populate('tags'),
    pages: model('Page'),
    categories: model('Category'),
    tags: model('Tag'),
    assets: model('Asset'),
    post_assets: model('PostAsset')
  };

  /**
  * Local variables for generators.
  *
  * @class Locals
  * @param {String} path
  * @param {Object} locals
  * @namespace Hexo.theme
  */

  var Locals = function(path, locals){
    /**
    * Page variables.
    *
    * @property page
    * @type Object
    */

    this.page = _.extend({path: path}, locals);

    /**
    * The path of current page.
    *
    * @property path
    * @type String
    */

    this.path = path;

    /**
    * The full URL of current page.
    *
    * @property url
    * @type String
    */

    this.url = config.url + config.root + path;

    /**
    * Site variables.
    *
    * @property site
    * @type Object
    */

    this.site = siteLocals;

    /**
    * Global configuration.
    *
    * @property config
    * @type Object
    */

    this.config = config;

    /**
    * Theme configuration.
    *
    * @property theme
    * @type Object
    */

    this.theme = themeLocals;

    /**
    * Expose of [Lodash](http://lodash.com/).
    *
    * @property _
    * @type Function
    */

    this._ = _;

    /**
    * i18n function.
    *
    * @property __
    * @type Function
    */

    this.__ = themei18n.get(config.language);

    /**
    * i18n function. (Plural)
    *
    * @property _p
    * @type Function
    */

    this._p = themei18n.plural(config.language);

    /**
    * Template layout.
    *
    * @property layout
    * @type String
    */

    this.layout = 'layout';

    /**
    * Whether cache is enabled or not.
    *
    * @property cache
    * @type Boolean
    */

    this.cache = options.cache;

    /**
    * Environment variables.
    *
    * @property env
    * @type Object
    */

    this.env = hexo.env;

    /**
    * The path of view directory.
    *
    * @property view_dir
    * @type String
    */

    this.view_dir = layoutDir;
  };

  async.each(hexo.extend.generator.list(), function(generator, next){
    generator(siteLocals, function(path, layouts, locals){
      if (!Array.isArray(layouts)) layouts = [layouts];

      layouts = _.uniq(layouts);

      var newLocals = new Locals(path, locals);

      route.set(path, function(fn){
        for (var i = 0, len = layouts.length; i < len; i++){
          var item = layouts[i];

          if (themeLayout.hasOwnProperty(item)){
            var layoutPath = pathFn.join(layoutDir, item + themeLayout[item]);
            break;
          }
        }

        if (layoutPath){
          hexo.log.d('Render %s: %s', layouts[i], path);
          hexo.render.renderFile(layoutPath, newLocals, fn);
        } else {
          hexo.log.d('No layout: %s', path);
          fn();
        }
      });
    }, next);
  }, callback);
};