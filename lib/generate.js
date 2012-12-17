var async = require('async'),
  extend = require('./extend'),
  generator = extend.generator.list(),
  processor = extend.processor.list(),
  renderer = extend.renderer.list(),
  helper = extend.helper.list(),
  render = require('./render'),
  renderSync = render.renderSync,
  route = require('./route'),
  Collection = require('./model').Collection,
  util = require('./util'),
  file = util.file,
  yfm = util.yfm,
  _ = require('underscore'),
  path = require('path'),
  sep = path.sep,
  fs = require('graceful-fs'),
  config = hexo.config,
  baseDir = hexo.base_dir,
  themeDir = hexo.theme_dir,
  publicDir = hexo.public_dir,
  i18n = hexo.i18n,
  layoutCache = {};

var themeRender = function(template, locals){
  if (!layoutCache[template]) return '';

  var layout = layoutCache[template],
    source = layout.source,
    extname = path.extname(source).substring(1),
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

module.exports = function(ignoreTheme, preview, callback){
  var rendererList = Object.keys(renderer),
    publicExist = false;

  async.auto({
    // Load theme config
    load: function(next){
      render.compile(themeDir + '_config.yml', next);
    },
    // Check if public folder exists
    check: function(next){
      if (preview) return next();

      fs.exists(publicDir, function(exist){
        if (exist) publicExist = exist;
        next();
      });
    },
    // Load cache
    cache: ['check', function(next){
      if (ignoreTheme && publicExist && !preview){
        var cachePath = baseDir + '.cache';

        fs.exists(cachePath, function(exist){
          if (exist){
            file.read(cachePath, function(err, content){
              next(err, JSON.parse(content).theme);
            });
          } else {
            ignoreTheme = false;
            next();
          }
        });
      } else {
        next();
      }
    }],
    // Load theme layout
    theme_layout: function(next){
      var layoutDir = themeDir + 'layout/';

      file.dir(layoutDir, function(files){
        async.forEach(files, function(item, next){
          var extname = path.extname(item),
            dirs = item.split(sep);

          for (var i=0, len=dirs.length; i<len; i++){
            var front = dirs[i].substr(0, 1);
            if (front === '_' || front === '.') return next();
          }

          file.read(layoutDir + item, function(err, content){
            if (err) throw err;

            var name = item.substring(0, item.length - extname.length);
            layoutCache[name] = yfm(content);
            layoutCache[name].source = layoutDir + item;
            next();
          });
        }, next);
      });
    },
    // Install theme assets
    theme_source: ['check', 'cache', function(next, results){
      if (ignoreTheme && publicExist && !preview) return next(null, results.cache);

      console.log('Installing theme.');

      var sourceDir = themeDir + 'source' + sep,
        list = [];

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
          var extname = path.extname(item).substring(1);

          if (rendererList.indexOf(extname) !== -1){
            var filename = item.substring(0, item.length - extname.length - 1),
              fileext = path.extname(filename),
              dest = filename + '.' + (fileext ? fileext.substring(1) : renderer[extname].output);

            list.push(dest);
            route.set(dest, function(func){
              render.compile(sourceDir + item, function(err, result){
                if (err) throw err;
                func(null, result);
              });
            });
          } else {
            list.push(item);
            route.set(item, function(func){
              var rs = fs.createReadStream(sourceDir + item);
              rs.source = item;
              func(null, rs);
            });
          }
        });

        next(null, list);
      });
    }],
    // Load theme i18n
    theme_i18n: function(next){
      var target = themeDir + 'languages';

      fs.exists(target, function(exist){
        if (exist){
          var theme_i18n = new i18n();
          theme_i18n.load(target, function(){
            next(null, theme_i18n.get);
          });
        } else {
          next();
        }
      });
    },
    store: ['theme_source', function(next, results){
      var cacheData = results.theme_source;
      if (cacheData && !preview){
        file.write(baseDir + '.cache', JSON.stringify({theme: cacheData}), next);
      } else {
        next();
      }
    }],
    clear: ['theme_source', function(next, results){
      if (publicExist && !preview){
        console.log('Clearing.');
        file.empty(publicDir, results.theme_source, next);
      } else {
        next();
      }
    }],
    process: ['clear', function(next){
      var site = {
        posts: new Collection(),
        pages: new Collection()
      };

      async.forEachSeries(processor, function(item, next){
        item(site, function(err, locals){
          if (err) throw err;
          if (locals) site = locals;
          next();
        });
      }, function(){
        next(null, site);
      });
    }],
    generate: ['load', 'theme_layout', 'process', function(next, results){
      var site = results.process;
      Object.freeze(site);

      async.forEach(generator, function(item, next){
        item(site, function(layout, locals){
          var newLocals = {
            page: locals,
            site: site,
            config: config,
            theme: results.load[0],
            __: results.theme_i18n
          };

          return themeRender(layout, newLocals);
        }, next);
      }, next);
    }]
  }, callback);
};