var _ = require('lodash'),
  async = require('async'),
  fs = require('graceful-fs'),
  pathFn = require('path'),
  watchr = require('watchr'),
  process = require('./process'),
  model = require('./model'),
  dbAssets = model.assets,
  route = require('./route'),
  util = require('./util'),
  file = util.file,
  yfm = util.yfm,
  i18n = require('./i18n').i18n,
  render = require('./render'),
  compile = render.compile,
  extend = require('./extend'),
  renderer = extend.renderer.list(),
  helper = extend.helper.list(),
  generator = extend.generator.list(),
  config = hexo.config,
  baseDir = hexo.base_dir,
  sourceDir = hexo.source_dir,
  themeDir = hexo.theme_dir,
  layoutDir = themeDir + 'layout/',
  layoutCache = {};

var freeze = function(obj){
  var result = {};

  _.each(obj, function(val, key){
    result.__defineGetter__(key, function(){
      return val;
    });
  });

  Object.freeze(result);

  return result;
};

var themeRender = function(template, locals){
  if (!layoutCache[template]) return '';

  var layout = layoutCache[template],
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

  var result = render.renderSync(content, extname, newLocals);

  return result;
};

module.exports = function(options, callback){
  var watch = hexo.cache.watch = options.watch;

  async.parallel([
    // Load theme config
    function(next){
      var path = themeDir + '_config.yml';
      fs.exists(path, function(exist){
        next(null, exist ? require(path) : null);
      });
    },
    // Load theme layout
    function(next){
      file.dir(layoutDir, function(files){
        async.forEach(files, function(item, next){
          var extname = pathFn.extname(item),
            split = item.split('/');

          for (var i=0, len=split.length; i<len; i++){
            var front = split[i].substring(0, 1);
            if (front === '_' || front === '.') return next();
          }

          file.read(layoutDir + item, function(err, content){
            if (err) throw new Error('Failed to read layout: ' + layoutDir + item);

            var name = item.substring(0, item.length - extname.length),
              layout = layoutCache[name] = yfm(content);
            layout.source = layoutDir + item;
            next();
          });
        }, function(){
          if (watch){
            watchr.watch({
              path: layoutDir,
              ignoreHiddenFiles: true,
              ignoreCustomPatterns: /^_/,
              listener: function(type, source, stat, lastStat){
                var extname = pathFn.extname(source),
                  name = source.substring(layoutDir.length, source.length - extname.length);

                if (type === 'delete'){
                  delete layoutCache[name];
                } else {
                  file.read(source, function(err, content){
                    if (err) throw new Error('Failed to read layout: ' + source);
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
    // Load theme i18n file
    function(next){
      var langDir = themeDir + 'languages';

      fs.exists(langDir, function(exist){
        var theme_i18n = new i18n();
        if (!exist) return next(null, theme_i18n);
        theme_i18n.load(langDir, function(){
          next(null, theme_i18n);
        });
      });
    },
    // Load theme source file
    function(next){
      var sourceDir = themeDir + 'source/',
        list = Object.keys(renderer);

      file.dir(sourceDir, function(files){
        files = _.filter(files, function(item){
          var split = item.split('/'),
            match = true;

          for (var i=0, len=split.length; i<len; i++){
            var front = split[i].substring(0, 1);
            if (front === '_' || front === '.'){
              match = false;
              break;
            }
          }

          return match;
        });

        async.forEach(files, function(item, next){
          var source = sourceDir + item,
            extname = pathFn.extname(item).substring(1);

          // Get the file status
          fs.stat(source, function(err, stats){
            if (err) throw new Error('Failed to read file status: ' + source);

            var data = dbAssets.findOne({path: source}),
              mtime = stats.mtime,
              latest = false;

            // Compare the modified time if the data exists
            if (data){
              if (data.mtime.getTime() === mtime.getTime()){
                latest = true;
              } else {
                dbAssets.update(data._id, {mtime: mtime});
              }
            } else {
              dbAssets.insert({path: source, mtime: mtime});
            }

            if (list.indexOf(extname) === -1){
              var content = function(fn){
                fn(null, fs.createReadStream(source));
              };
              content._latest = latest;
              route.set(item, content);
            } else {
              var filename = item.substring(0, item.length - extname.length - 1),
                fileext = pathFn.extname(filename),
                dest = filename + '.' + (fileext ? fileext.substring(1) : renderer[extname].output);

              var content = function(fn){
                compile(source, function(err, result){
                  if (err) throw new Error('Failed to compile file: ' + source);
                  fn(null, result);
                });
              };
              content._latest = latest;
              route.set(dest, content);
            }

            next();
          });
        }, next);
      });
    }
  ], function(err, results){
    var themeConfig = results[0] ? freeze(results[0]) : {},
      themei18n = results[2].get;

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
                __: themei18n
              };

              return themeRender(layout, newLocals);
            }, next);
          }, next);
        }
      ], callback);
    };

    // First process
    file.dir(sourceDir, function(files){
      files = _.filter(files, function(item){
        var split = item.split('/'),
          match = true;

        for (var i=0, len=split.length; i<len; i++){
          if (split[i].substring(0, 1) === '.'){
            match = false;
            break;
          }
        }

        return match;
      });

      process(files, function(){
        afterProcess(function(){
          if (watch){
            watchr.watch({
              path: sourceDir,
              ignoreHiddenFiles: true,
              listener: function(type, source, stat, lastStat){
                var path = source.substring(sourceDir.length);
                process({path: path, type: type}, function(){
                  afterProcess(callback);
                });
              }
            });
          }

          callback();
        });
      });
    });
  });
};