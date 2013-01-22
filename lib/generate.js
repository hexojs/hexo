var _ = require('underscore'),
  async = require('async'),
  fs = require('graceful-fs'),
  pathFn = require('path'),
  sep = pathFn.sep,
  process = require('./process'),
  model = require('./model'),
  route = require('./route'),
  util = require('./util'),
  file = util.file,
  yfm = util.yfm,
  i18n = require('./i18n').i18n,
  render = require('./render'),
  extend = require('./extend'),
  renderer = extend.renderer.list(),
  helper = extend.helper.list(),
  generator = extend.generator.list(),
  config = hexo.config,
  sourceDir = hexo.source_dir,
  themeDir = hexo.theme_dir,
  layoutDir = themeDir + 'layout' + sep,
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
  if (!cache[template]) return '';

  var layout = cache[template],
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

module.exports = function(options, callback){
  async.auto({
    theme_config: function(next){
      var path = themeDir + '_config.yml';

      fs.exists(path, function(exist){
        if (!exist) return next();
        next(null, require(path));
      });
    },
    theme_layout: function(next){
      file.dir(layoutDir, function(files){
        async.forEach(files, function(item, next){
          var extname = pathFn.extname(item),
            split = item.split(sep);

          for (var i=0, len=split.length; i<len; i++){
            var front = split[i].substring(0, 1);
            if (front === '_' || front === '.') return next();
          }

          file.read(layoutDir + item, function(err, content){
            if (err) throw new Error('Failed to read layout: ' + layoutDir + item);

            var name = item.substring(0, item.length - extname.length);
            layoutCache[name] = yfm(content);
            next();
          })
        }, next);
      });
    },
    theme_i18n: function(next){
      var path = themeDir + 'languages';

      fs.exists(path, function(exist){
        if (!exist) return next();

        var theme_i18n = new i18n();
        theme_i18n.load(path, function(){
          next(null, theme_i18n);
        });
      });
    },
    theme_source: function(next){
      var rendererList = Object.keys(renderer);

      var sourceDir = themeDir + 'source' + sep;

      file.dir(sourceDir, function(files){
        files = _.filter(files, function(item){
          var dirs = item.split(sep);

          for (var i=0, len=dirs.length; i<len; i++){
            var front = dirs[i].substr(0, 1);
            if (front === '_' || front === '.') return false;
          }

          return true;
        });

        files.forEach(function(item){
          var extname = pathFn.extname(item).substring(1);

          if (rendererList.indexOf(extname) !== -1){
            var filename = item.substring(0, item.length - extname.length - 1),
              fileext = pathFn.extname(filename),
              dest = filename + '.' + (fileext ? fileext.substring(1) : renderer[extname].output);

            route.set(dest, function(func){
              compile(sourceDir + item, function(err, result){
                if (err) throw new Error('Failed to compile file: ' + sourceDir + item);
                func(null, result);
              });
            })
          } else {
            route.set(item, function(func){
              var rs = fs.createReadStream(sourceDir + item);
              func(null, rs);
            });
          }
        });

        next();
      });
    },
    process: function(next){
      file.dir(sourceDir, function(files){
        files = _.filter(files, function(item){
          return item.substring(0, 1) !== '.';
        });

        process(files, next);
      });
    },
    generate: ['theme_config', 'theme_layout', 'theme_i18n', 'process', function(next, results){
      var themeConfig = results.theme_config,
        themei18n = results.theme_i18n;

      async.forEach(generator, function(item, next){
        item(model, function(layout, locals){
          var newLocals = {
            page: locals,
            site: model,
            config: config,
            theme: themeConfig,
            __: themei18n
          }

          return themeRender(layout, newLocals);
        }, next);
      }, next);
    }]
  }, function(err){
    if (err) throw new Error('Generate error');
    callback();
  });
};