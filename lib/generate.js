var util = require('./util'),
  file = util.file,
  yfm = util.yfm,
  process = require('./process'),
  render = require('./render'),
  compile = render.compile,
  renderSync = render.renderSync,
  model = require('./model'),
  dbAssets = model.assets,
  extend = require('./extend'),
  renderer = extend.renderer.list(),
  generator = extend.generator.list(),
  helper = extend.helper.list(),
  route = require('./route'),
  i18n = require('./i18n').i18n,
  _ = require('lodash'),
  async = require('async'),
  fs = require('graceful-fs'),
  pathFn = require('path'),
  watchr = require('watchr'),
  config = hexo.config;

var hiddenFileRegex = /^[^\.](?:(?!\/\.).)*$/,
  hiddenAdvFileRegex = /^[^_\.](?:(?!\/[_\.]).)*$/;

module.exports = function(options, callback){
  var sourceDir = hexo.source_dir,
    themeDir = hexo.theme_dir,
    watch = hexo.cache.watch = options.watch,
    themeConfig = {},
    themeLayout = {},
    themei18n = new i18n();

  var themeRender = function(template, locals){
    if (!themeLayout[template]) return '';

    var layout = themeLayout[template],
      source = layout.source,
      extname = pathFn.extname(source).substring(1),
      newHelper = _.clone(helper);

    _.each(newHelper, function(val, key){
      newHelper[key] = val(source, layout.content, locals);
    });

    var newLocals = _.extend(locals, newHelper);

    if (layout.layout){
      var content = themeRender(layout.layout, _.extend(locals, {body: layout._content}));
    } else {
      var content = layout._content;
    }

    var result = renderSync(content, extname, newLocals);

    return result;
  };

  var afterProcess = function(callback){
    async.parallel([
      function(next){
        hexo.db.save(next);
      },
      function(next){
        async.forEach(generator, function(item, next){
          item(model, function(layout, locals){
            var newLocals = {
              page: locals,
              site: model,
              config: config,
              theme: themeConfig,
              __: themei18n.get
            };

            return themeRender(layout, newLocals);
          }, next);
        }, next);
      }
    ], callback);
  };

  async.parallel([
    // Load theme config
    function(next){
      var path = themeDir + '_config.yml';
      fs.exists(path, function(exist){
        if (!exist) return next();
        compile(path, function(err, result){
          if (err) return new Error('Theme config load error: ' + source);
          themeConfig = result;
          Object.freeze(themeConfig);
          next();
        });
      });
    },
    // Load theme layout
    function(next){
      var layoutDir = themeDir + 'layout/';
      file.dir(layoutDir, function(files){
        files = _.filter(files, function(item){
          return hiddenAdvFileRegex.test(item);
        });

        async.forEach(files, function(item, next){
          var extname = pathFn.extname(item),
            source = layoutDir + item;

          file.read(source, function(err, content){
            if (err) throw new Error('Layout read error: ' + source);

            var name = item.substring(0, item.length - extname.length),
              layout = themeLayout[name] = yfm(content);
            layout.source = source;
            next();
          });
        }, function(){
          if (watch){
            watchr.watch({
              path: layoutDir,
              ignoreHiddenFiles: true,
              ignoreCustomPatterns: hiddenAdvFileRegex,
              listener: function(type, source, stat, lastStat){
                var extname = pathFn.extname(item),
                  name = source.substring(0, layoutDir.length, source.length - extname.length);

                if (type === 'delete'){
                  delete layoutCache[name];
                } else {
                  file.read(source, function(err, content){
                    if (err) throw new Error('Layout read error: ' + source);
                    var layout = layoutCache[name] = yfm(content);
                    layout.source = source;
                  });
                }
              }
            });
          }
          next();
        });
      });
    },
    // Load theme source
    function(next){
      var sourceDir = themeDir + 'source/',
        list = Object.keys(renderer);

      file.dir(sourceDir, function(files){
        files = _.filter(files, function(item){
          return hiddenAdvFileRegex.test(item);
        });

        async.forEach(files, function(item, next){
          var source = sourceDir + item,
            extname = pathFn.extname(item).substring(1);

          fs.stat(source, function(err, stats){
            if (err) throw new Error('File status read error: ' + source);

            var data = dbAssets.findOne({source: source}),
              mtime = stats.mtime,
              latest = false;

            if (data){
              if (data.mtime.getTime() === mtime.getTime()){
                latest = true;
              } else {
                dbAssets.update(data._id, {mtime: mtime});
              }
            } else {
              dbAssets.insert({source: source, mtime: mtime});
            }

            if (list.indexOf(extname) === -1){
              var content = function(fn){
                fn(null, fs.createReadStream(source));
              };
              content.latest = latest;
              route.set(item, content);
            } else {
              var filename = item.substring(0, item.length - extname.length - 1),
                fileext = pathFn.extname(filename),
                dest = filename + '.' + (fileext ? fileext.substring(1) : renderer[extname].output);

              var content = function(fn){
                compile(source, function(err, result){
                  if (err) throw new Error('Compile error: ' + source);
                  fn(null, result);
                });
              };
              content.latest = latest;
              route.set(dest, content);
            }

            next();
          });
        }, next);
      });
    },
    // Load theme i18n
    function(next){
      var langDir = themeDir + 'languages';

      fs.exists(langDir, function(exist){
        if (!exist) return next();
        themei18n.load(langDir, next);
      });
    },
    // First process
    function(next){
      file.dir(sourceDir, function(files){
        files = _.filter(files, function(item){
          return hiddenFileRegex.test(item);
        });

        process(files, next);
      });
    }
  ], function(){
    afterProcess(function(){
      callback();
    });
  });
};