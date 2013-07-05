var async = require('async'),
  fs = require('graceful-fs'),
  pathFn = require('path'),
  watchr = require('watchr'),
  _ = require('lodash'),
  util = require('./util'),
  file = util.file2,
  yfm = util.yfm,
  extend = require('./extend'),
  generators = extend.generator.list(),
  process = require('./process'),
  renderFn = require('./render'),
  render = renderFn.render,
  renderFile = renderFn.renderFile,
  isRenderable = renderFn.isRenderable,
  getOutput = renderFn.getOutput,
  i18n = require('./i18n').i18n,
  route = require('./route'),
  HexoError = require('./error'),
  log = hexo.log,
  config = hexo.config,
  urlConfig = config.url,
  rootConfig = config.root,
  baseDir = hexo.base_dir,
  sourceDir = hexo.source_dir,
  themeDir = hexo.theme_dir,
  layoutDir = themeDir + 'layout/',
  model = hexo.model,
  Asset = model('Asset'),
  Cache = model('Cache');

var rHiddenFile = /^(_|\.)/;

module.exports = function(options, callback){
  if (_.isFunction(options)){
    callback = options;
    options = {};
  }

  options = _.defaults(options, {
    theme_watch: false,
    source_watch: false
  });

  var themeWatch = options.theme_watch,
    sourceWatch = options.source_watch,
    themeConfig = {},
    themeLayout = {},
    themei18n = new i18n();

  async.parallel([
    // Load theme config
    function(next){
      var path = themeDir + '_config.yml';

      fs.exists(path, function(exist){
        if (!exist) return next();

        render({path: path}, function(err, result){
          if (err) return callback(HexoError(err, 'Theme configuration file load failed'));

          themeConfig = result;

          log.d('Theme configuration file loaded successfully');
          next();
        })
      });
    },
    // Load theme layout
    function(next){
      fs.exists(layoutDir, function(exist){
        if (!exist) return next();

        file.list(layoutDir, {ignorePattern: rHiddenFile}, function(err, files){
          if (err) return callback(HexoError(err, 'Theme layout folder load failed'));

          files.forEach(function(item){
            var extname = pathFn.extname(item),
              name = item.substring(0, item.length - extname.length);

            themeLayout[name] = extname;
          });

          if (themeWatch){
            watchr.watch({
              path: layoutDir,
              ignoreHiddenFiles: true,
              ignoreCustomPatterns: rHiddenFile,
              listener: function(type, source){
                source = source.replace(/\\/g, '/');

                var extname = pathFn.extname(source),
                  name = source.substring(layoutDir.length, source.length - extname.length);

                if (type === 'delete'){
                  log.d('Theme layout file deleted: ' + source);
                  delete themeLayout[name];
                } else {
                  log.d('Theme layout file updated: ' + source);
                  themeLayout[name] = extname;
                }
              }
            });
          }

          log.d('Theme layout files loaded successfully');
          next();
        });
      });
    },
    // Load theme source
    function(next){
      var sourceDir = themeDir + 'source/';

      fs.exists(sourceDir, function(exist){
        if (!exist) return next();

        file.list(sourceDir, {ignorePattern: rHiddenFile}, function(err, files){
          if (err) return callback(HexoError(err, 'Theme source folder load failed'));

          async.forEach(files, function(item, next){
            themeSourceProcess(item, next);
          }, function(){
            if (themeWatch){
              watchr.watch({
                path: sourceDir,
                ignoreHiddenFiles: true,
                ignoreCustomPattern: rHiddenFile,
                listener: function(type, source){
                  source = source.replace(/\\/g, '/');

                  var path = source.substring(sourceDir.length);

                  if (type === 'delete'){
                    var data = Asset.findOne({source: source.substring(baseDir.length)});

                    if (data) Asset.remove(data._id);
                    route.remove(path);
                    log.d('Theme source file deleted: ' + source);
                  } else {
                    themeSourceProcess(path, function(){
                      log.d('Theme source file updated: ' + source);
                    });
                  }
                }
              });
            }

            log.d('Theme source files loaded successfully');
            next();
          });
        });
      });
    },
    // Load theme i18n
    function(next){
      var langDir = themeDir + 'languages';

      fs.exists(langDir, function(exist){
        if (!exist) return next();

        themei18n.load(langDir, function(err){
          if (err) return callback(HexoError(err, 'Theme i18n file load failed'));

          log.d('Theme i18n file loaded successfully');
          next();
        });

        // TODO watch theme i18n files
      });
    },
    // Start processing
    function(next){
      file.list(sourceDir, function(err, files){
        if (err) return callback(HexoError(err, 'Source folder load failed'));

        log.d('Source folder loaded successfully');
        process(files, next);
      });
    }
  ], function(err){
    if (err) return callback(err);

    postProcess(function(){
      callback();

      if (sourceWatch){
        var arr = [],
          timer;

        var timerFn = function(){
          if (arr.length){
            process(arr, postProcess);
            arr = [];
          }
        };

        watchr.watch({
          path: sourceDir,
          ignoreHiddenFiles: true,
          listener: function(type, source){
            source = source.replace(/\\/g, '/');

            var path = source.substring(sourceDir.length);

            if (type === 'delete'){
              log.d('Source file deleted: ' + source);
            } else {
              log.d('Source file updated: ' + source);
            }

            clearTimeout(timer);
            arr.push({type: type, path: path});
            timer = setTimeout(timerFn, 100);
          }
        });
      }
    });
  });

  var postProcess = function(callback){
    async.parallel([
      // Save cache
      function(next){
        var store = {
          asset: Asset._store.list(),
          cache: Cache._store.list()
        };

        var json = JSON.stringify(store);

        file.writeFile(baseDir + 'db.json', json, function(err){
          if (err) return callback(HexoError(err, 'Cache save failed'));

          log.d('Cache saved successfully (Size: %d)', json.length);
          next();
        });
      },
      function(next){
        async.forEach(generators, function(generator, next){
          generator(model, function(path, layout, locals){
            if (!Array.isArray(layout)) layout = [layout];

            var newLocals = {
              page: locals,
              site: model,
              config: config,
              theme: themeConfig,
              __: themei18n.get,
              path: path,
              url: urlConfig + rootConfig + path,
              layout: 'layout',
              cache: !themeWatch
            };

            for (var i = 0, len = layout.length; i < len; i++){
              var item = layout[i];

              if (themeLayout.hasOwnProperty(item)){
                var layoutPath = layoutDir + item + themeLayout[item];
                break;
              }
            }

            route.set(path, function(fn){
              renderFile(layoutPath, newLocals, fn);
            });
          }, next);
        }, next);
      }
    ], callback);
  };

  var themeSourceProcess = function(path, callback){
    var source = themeDir + 'source/' + path;

    Asset.checkModified(source, function(err, modified){
      if (err) return callback(HexoError(err, 'Theme source file load failed'));

      if (isRenderable(path)){
        var extname = pathFn.extname(path),
          filename = path.substring(0, path.length - extname.length),
          subext = pathFn.extname(filename),
          dest = filename + '.' + (subext ? subext.substring(1) : getOutput(extname));

        var content = function(fn){
          render({path: source}, function(err, result){
            if (err) return callback(err);

            fn(null, result);
          });
        };

        content.modified = modified;
        route.set(dest, content);
      } else {
        var content = function(fn){
          fn(null, fs.createReadStream(source));
        };

        content.modified = modified;
        route.set(path, content);
      }

      callback();
    });
  };
};