var async = require('async'),
  fs = require('graceful-fs'),
  pathFn = require('path'),
  _ = require('lodash'),
  watch = require('watch'),
  util = require('../util'),
  file = util.file2,
  i18n = require('../i18n'),
  HexoError = require('../error'),
  process = require('./process');

var extend = hexo.extend,
  generators = extend.generator.list();

var renderFn = hexo.render,
  render = renderFn.render,
  renderFile = renderFn.renderFile,
  isRenderable = renderFn.isRenderable,
  getOutput = renderFn.getOutput;

var model = hexo.model,
  Asset = model('Asset'),
  Cache = model('Cache'),
  Post = model('Post'),
  Page = model('Page'),
  Category = model('Category'),
  Tag = model('Tag');

var log = hexo.log,
  config = hexo.config,
  route = hexo.route,
  baseDir = hexo.base_dir;

var rHiddenFile = /^_|\/_|[~%]$/;

var watchCallback = function(next, callback){
  return function(src, curr, prev){
    if (typeof src === 'object' && prev == null && curr == null) return next();
    if ((curr && curr.isDirectory()) || (prev && prev.isDirectory())) return;

    if (prev == null){
      callback('create', src);
    } else if (curr.nlink == 0){
      callback('delete', src);
    } else {
      callback('update', src);
    }
  }
};

module.exports = function(options, callback){
  if (!callback){
    callback = options;
    options = {};
  }

  var options = _.extend({
    watch: false
  }, options);

  var themeDir = hexo.theme_dir,
    themeConfig = _.clone(config),
    themeLayout = {},
    themei18n = new i18n();

  async.auto({
    // Loads theme config
    config: function(next){
      var configPath = pathFn.join(themeDir, '_config.yml');

      fs.exists(configPath, function(exist){
        if (!exist) return next();

        render({path: configPath}, function(err, result){
          if (err) return callback(HexoError.wrap(err, 'Theme configuration load failed'));

          _.extend(themeConfig, result);
          hexo.theme_config = themeConfig;

          log.d('Theme configuration loaded');
          next();
        });
      });
    },
    // Loads theme layouts
    layout: function(next){
      var layoutDir = pathFn.join(themeDir, 'layout');

      fs.exists(layoutDir, function(exist){
        if (!exist) return next(null, false);

        file.list(layoutDir, {ignorePattern: rHiddenFile}, function(err, files){
          if (err) return callback(HexoError.wrap(err, 'Theme layout load failed'));

          files.forEach(function(item){
            var extname = pathFn.extname(item),
              name = item.substring(0, item.length - extname.length);

            themeLayout[name] = extname;
          });

          log.d('Theme layout loaded');
          next(null, true);
        });
      });
    },
    // Watchs theme layout changes
    watchLayout: ['layout', function(next, results){
      if (!options.watch || !results.layout) return next();

      var layoutDir = pathFn.join(themeDir, 'layout');

      log.d('Start watching theme layout...');

      watch.watchTree(layoutDir, {
        ignoreDotFiles: true,
        interval: 1000,
        filter: function(src){
          return rHiddenFile.test(src.substring(layoutDir.length + 1));
        }
      }, watchCallback(next, function(type, src){
        var extname = pathFn.extname(src),
          name = src.substring(layoutDir.length + 1, src.length - extname.length);

        if (type === 'create'){
          themeLayout[name] = extname;
          log.log('create', 'Theme layout: %s', name);
        } else if (type === 'delete'){
          delete themeLayout[name];
          log.log('delete', 'Theme layout: %s', name);
        } else {
          themeLayout[name] = extname;
          log.log('update', 'Theme layout: %s', name);
        }
      }));
    }],
    // Loads theme source files
    source: function(next){
      var sourceDir = pathFn.join(themeDir, 'source');

      fs.exists(sourceDir, function(exist){
        if (!exist) return next(null, false);

        file.list(sourceDir, {ignorePattern: rHiddenFile}, function(err, files){
          if (err) return callback(HexoError.wrap(err, 'Theme source load failed'));

          async.forEach(files, function(item, next){
            themeSourceProcess(item, next);
          }, function(err){
            if (err) return callback(err);

            log.d('Theme source loaded');
            next(null, true);
          });
        });
      });
    },
    // Watchs theme source file changes
    watchSource: ['source', function(next, results){
      if (!options.watch || !results.source) return next();

      var sourceDir = pathFn.join(themeDir, 'source');

      log.d('Start watching theme source...');

      watch.watchTree(sourceDir, {
        ignoreDotFiles: true,
        interval: 1000,
        filter: function(src){
          return rHiddenFile.test(src.substring(sourceDir.length + 1));
        }
      }, watchCallback(next, function(type, src){
        var path = src.substring(sourceDir.length + 1);

        if (type === 'create'){
          themeSourceProcess(path, function(err){
            if (err) return log.e(err);

            log.log('create', 'Theme source: %s', path);
          });
        } else if (type === 'delete'){
          var data = Asset.findOne({
            source: src.substring(baseDir.length + 1)
          });

          if (data) data.remove();
          route.remove(path);
          log.log('delete', 'Theme source: %s', path);
        } else {
          themeSourceProcess(path, function(err){
            if (err) return log.e(err);

            log.log('update', 'Theme source: %s', path);
          });
        }
      }));

      next();
    }],
    // Loads theme i18n files
    i18n: function(next){
      var langDir = pathFn.join(themeDir, 'languages');

      fs.exists(langDir, function(exist){
        if (!exist) return next();

        themei18n.load(langDir, function(err){
          if (err) return callback(HexoError.wrap(err, 'Theme i18n load failed'));

          log.d('Theme i18n loaded');
          next();
        });
      });
    },
    // Loads and processes source files
    process: function(next){
      var sourceDir = hexo.source_dir;

      file.list(sourceDir, {ignorePattern: /[~%]$/}, function(err, files){
        if (err) return callback(HexoError.wrap(err, 'Source load failed'));

        process(files, function(err){
          if (err) return callback(err);

          next();
        });
      });
    }
  }, function(err){
    if (err) return callback(err);

    postProcess(function(err){
      if (err) return callback(err);

      if (options.watch){
        var sourceDir = hexo.source_dir,
          arr = [],
          timer;

        var timerFn = function(){
          if (arr.length){
            process(arr, postProcess);
            arr.length = 0;
          }
        };

        // Watchs source file changes
        watch.watchTree(sourceDir, {
          ignoreDotFiles: true,
          interval: 1000,
          filter: function(src){
            return /[~%]$/.test(src);
          }
        }, watchCallback(callback, function(type, src){
          var data = {
            path: src.substring(sourceDir.length),
            type: type
          };

          if (type === 'create'){
            log.log('create', 'Source: %s', data.path);
          } else if (type === 'delete'){
            log.log('delete', 'Source: %s', data.path);
          } else {
            log.log('update', 'Source: %s', data.path);
          }

          if (timer) clearTimeout(timer);
          arr.push(data);
          timer = setTimeout(timerFn, 100);
        }));
      } else {
        callback();
      }
    });
  });

  var postProcess = function(callback){
    if (typeof callback !== 'function') callback = function(){};

    async.parallel([
      // Saves cache to database
      function(next){
        var store = {
          Asset: Asset._store.list(),
          Cache: Cache._store.list()
        };

        file.writeFile(pathFn.join(hexo.base_dir, 'db.json'), JSON.stringify(store), function(err){
          if (err) return callback(HexoError(err, 'Cache save failed'));

          log.d('Cache saved');
          next();
        });
      },
      // Runs generators
      function(next){
        var siteLocals = {
          posts: Post.populate('categories').populate('tags'),
          pages: Page,
          categories: Category,
          tags: Tag
        };

        var viewDir = pathFn.join(hexo.theme_dir, 'layout');

        async.forEach(generators, function(generator, next){
          generator(siteLocals, function(path, layout, locals){
            if (!Array.isArray(layout)) layout = [layout];

            layout = _.uniq(layout);

            var newLocals = {
              page: _.extend({path: path}, locals),
              site: siteLocals,
              config: config,
              theme: themeConfig,
              _: _,
              __: themei18n.get(config.language),
              _p: themei18n.plural(config.language),
              path: path,
              url: config.url + config.root + path,
              layout: 'layout',
              cache: !options.watch,
              view_dir: viewDir
            };

            route.set(path, function(fn){
              for (var i = 0, len = layout.length; i < len; i++){
                var item = layout[i];

                if (themeLayout.hasOwnProperty(item)){
                  var layoutPath = pathFn.join(themeDir, 'layout', item + themeLayout[item]);
                  break;
                }
              }

              if (layoutPath){
                log.d('Render %s: %s', layout[i], path);
                renderFile(layoutPath, newLocals, fn);
              } else {
                log.d('No layout: %s', path);
                fn();
              }
            });
          }, next);
        }, next);
      }
    ], callback);
  };

  var themeSourceProcess = function(src, callback){
    var source = pathFn.join(themeDir, 'source', src);

    Asset.checkModified(source.substring(baseDir.length), function(err, modified){
      if (err) return callback(HexoError.wrap(err, 'Theme source load failed: ' + src));

      if (isRenderable(src)){
        var extname = pathFn.extname(src),
          filename = src.substring(0, src.length - extname.length),
          subext = pathFn.extname(filename),
          dest = filename + '.' + (subext ? subext.substring(1) : getOutput(src));

        var content = function(callback){
          render({path: source}, function(err, result){
            if (err) return callback(HexoError.wrap(err, 'Theme source render failed: ' + src));

            callback(null, result);
          });
        };

        content.modified = modified;
        route.set(dest, content);
      } else {
        var content = function(callback){
          callback(null, fs.createReadStream(source));
        };

        content.modified = modified;
        route.set(src, content);
      }

      callback();
    });
  };
}