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
  Cache = model('Cache');

var log = hexo.log,
  config = hexo.config,
  route = hexo.route,
  baseDir = hexo.base_dir;

var rHiddenFile = /^(_|\.)|[~%]$/;

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
    watchLayout: ['layout', function(next, results){
      if (!options.watch || !results.layout) return next();

      var layoutDir = pathFn.join(themeDir, 'layout');

      log.d('Start watching theme layout...');

      watch.watchTree(layoutDir, {
        ignoreDotFiles: true,
        interval: 1000,
        filter: function(src){
          return rHiddenFile.test(src);
        }
      }, function(src, curr, prev){
        if (typeof src === 'object' && prev == null && curr == null) return next();

        var extname = pathFn.extname(src),
          name = src.substring(layoutDir.length + 1, src.length - extname.length);

        if (prev == null){ // create
          themeLayout[name] = extname;
          log.log('created', 'Theme layout:', name);
        } else if (curr.nlink == 0){ // delete
          delete themeLayout[name];
          log.log('deleted', 'Theme layout:', name);
        } else { // update
          themeLayout[name] = extname;
          log.log('updated', 'Theme layout:', name);
        }
      });
    }],
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
    watchSource: ['source', function(next, results){
      if (!options.watch || !results.source) return next();

      var sourceDir = pathFn.join(themeDir, 'source');

      log.d('Start watching theme source...');

      watch.watchTree(sourceDir, {
        ignoreDotFiles: true,
        interval: 1000,
        filter: function(src){
          return rHiddenFile.test(src)
        }
      }, function(src, curr, prev){
        if (typeof src === 'object' && prev == null && curr == null) return next();

        var path = src.substring(sourceDir.length + 1);

        if (prev == null){ // create
          themeSourceProcess(path, function(err){
            if (err) return log.e(err);

            log.log('created', 'Theme source:', path);
          });
        } else if (curr.nlink == 0){ // delete
          var data = Asset.findOne({
            source: src.substring(baseDir.length + 1)
          });

          if (data) data.remove();
          route.remove(path);
          log.log('deleted', 'Theme source:', path);
        } else { // update
          themeSourceProcess(path, function(err){
            if (err) return log.e(err);

            log.log('updated', 'Theme source:', path);
          });
        }
      });

      next();
    }],
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

        watch.watchTree(sourceDir, {
          ignoreDotFiles: true,
          interval: 1000,
          filter: function(src){
            return /[~%]$/.test(src)
          }
        }, function(src, curr, prev){
          if (typeof src === 'object' && prev == null && curr == null) return callback();

          var data = {
            path: src.substring(sourceDir.length)
          };

          if (prev == null){ // create
            data.type = 'create';
            log.log('created', 'Source:', data.path);
          } else if (curr.nlink == 0){ // delete
            data.type = 'delete';
            log.log('deleted', 'Source:', data.path);
          } else { // update
            data.type = 'update';
            log.log('updated', 'Source:', data.path);
          }

          if (timer) clearTimeout(timer);
          arr.push(data);
          timer = setTimeout(timerFn, 100);
        });
      } else {
        callback();
      }
    });
  });

  var postProcess = function(callback){
    if (typeof callback !== 'function') callback = function(){};
    
    async.parallel([
      // Save cache
      function(next){
        var store = {
          Asset: Asset._store,
          Cache: Cache._store
        };

        file.writeFile(pathFn.join(hexo.base_dir, 'db.json'), JSON.stringify(store), function(err){
          if (err) return callback(HexoError(err, 'Cache save failed'));

          log.d('Cache saved');
          next();
        });
      },
      function(next){
        var siteLocals = {
          posts: model('Post').populate('categories').populate('tags'),
          pages: model('Page'),
          categories: model('Category'),
          tags: model('Tag')
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

            for (var i = 0, len = layout.length; i < len; i++){
              var item = layout[i];

              if (themeLayout.hasOwnProperty(item)){
                var layoutPath = pathFn.join(themeDir, 'layout', item + themeLayout[item]);
                break;
              }
            }

            if (!layoutPath) return;

            route.set(path, function(fn){
              log.d('Render %s: %s', layout[i], path);
              renderFile(layoutPath, newLocals, fn);
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