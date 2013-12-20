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
  _ = require('lodash'),
  i18n = require('./i18n'),
  HexoError = require('../error'),
  util = require('../util'),
  file = util.file2;

var rHiddenFile = /\/[\.|_]|[~%]$/;

var themeConfig = {},
  themeLayout = {},
  themei18n = new i18n(),
  isRunning = false,
  isReady = false;

var _layoutDir = function(){
  return pathFn.join(hexo.theme_dir, 'layout') + pathFn.sep;
};

var _sourceDir = function(){
  return pathFn.join(hexo.theme_dir, 'source') + pathFn.sep;
};

var _languageDir = function(){
  return pathFn.join(hexo.theme_dir, 'languages') + pathFn.sep;
};

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

var _watchConfig = function(type, src, stats, callback){
  if (type === 'delete'){
    themeConfig = {};

    callback();
  } else {
    _loadConfig(callback);
  }
};

var _watchLayout = function(type, src, stats, callback){
  var extname = pathFn.extname(src),
    name = src.substring(_layoutDir().length, src.length - extname.length);

  if (type === 'delete'){
    delete themeLayout[name];
  } else {
    themeLayout[name] = extname;
  }

  callback();
};

var _watchSource = function(type, src, stats, callback){
  var source = src.substring(_sourceDir().length),
    Asset = hexo.model('Asset');

  if (type === 'delete'){
    var data = Asset.findOne({
      source: src.substring(hexo.base_dir.length)
    });

    if (data) data.remove();
    route.remove(source);
    callback();
  } else {
    _processSource(source, function(err){
      if (err) return hexo.log.e(err);

      callback();
    });
  }
};

var _watchi18n = function(type, src, stats, callback){
  // @TODO Watch changes of theme language files
  callback();
};

/**
* Watches theme changes.
*
* @method watch
* @param {Function} [callback]
* @async
* @static
*/

exports.watch = function(callback){
  if (typeof callback !== 'function') callback = function(){};
  if (!isReady) return;

  var queue = [],
    isRunning = false,
    timer;

  var timerFn = function(){
    if (queue.length && !isRunning){
      isRunning = true;

      async.series([
        function(next){
          async.each(queue, function(item, next){
            var path = item.path,
              src = item.source,
              type = item.type,
              stats = item.stats;

            if (path === '_config.yml'){
              _watchConfig(type, src, stats, next);
            } else if (/^layout\//.test(path)){
              _watchLayout(type, src, stats, next);
            } else if (/^source\//.test(path)){
              _watchSource(type, src, stats, next);
            } else if (/^languages\//.test(path)){
              _watchi18n(type, src, stats, next);
            }
          }, next);
        },
        function(next){
          generate({watch: true}, next);
        }
      ], function(err){
        if (err) hexo.log.e(err);

        isRunning = false;
        callback();
      });
    }
  };

  var ignoreFn = function(src){
    if (rHiddenFile.test(src) && src.substring(hexo.theme_dir.length) !== '_config.yml'){
      return true;
    } else {
      return false;
    }
  };

  file.watch(hexo.theme_dir, {ignorePattern: ignoreFn}, function(type, src, stats){
    if (type === 'error'){
      hexo.log.e('Theme watch error: ' + src);
    }

    var data = {
      path: src.substring(hexo.theme_dir.length),
      source: src,
      stats: stats,
      type: type
    };

    if (timer) clearTimeout(timer);

    hexo.log.log(type, 'Theme: %s', data.path);
    queue.push(data);

    timer = setTimeout(timerFn, 100);
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

var generate = exports.generate = function(options, callback){
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

  var siteLocals = hexo.locals._generate();

  var Locals = function(path, locals){
    this.page = _.extend({path: path}, locals);
    this.path = path;
    this.url = config.url + config.root + path;
    this.site = siteLocals;
    this.config = config;
    this.theme = themeLocals;
    this._ = _;
    this.__ = themei18n.get(config.language);
    this._p = themei18n.plural(config.language);
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