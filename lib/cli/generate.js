var async = require('async'),
  extend = require('../extend'),
  generator = extend.generator.list(),
  processor = extend.processor.list(),
  helper = extend.helper.list(),
  render = require('../render'),
  renderSync = render.renderSync,
  Collection = require('../model').Collection,
  util = require('../util'),
  file = util.file,
  yfm = util.yfm,
  _ = require('underscore'),
  path = require('path'),
  fs = require('fs'),
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

extend.console.register('generate', 'Generate static files', function(args){
  var renderer = Object.keys(extend.renderer.list()),
    start = new Date(),
    ignoreTheme = false,
    publicExist = false;

  if (args.indexOf('-t') !== -1 || args.indexOf('--theme') !== -1) ignoreTheme = true;

  async.auto({
    // Load theme config
    load: function(next){
      render.compile(themeDir + '_config.yml', next);
    },
    // Check if public folder exists
    check: function(next){
      fs.exists(publicDir, function(exist){
        if (exist) publicExist = exist;
        next();
      });
    },
    // Load cache
    cache: ['check', function(next){
      if (ignoreTheme && publicExist){
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
            dirs = item.split(path.sep);

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
      if (ignoreTheme && publicExist) return next(null, results.cache);

      console.log('Installing theme.');

      var sourceDir = themeDir + 'source/',
        list = [];

      file.dir(sourceDir, function(files){
        async.forEach(files, function(item, next){
          var extname = path.extname(item),
            dirs = item.split(path.sep);

          for (var i=0, len=dirs.length; i<len; i++){
            var front = dirs[i].substr(0, 1);
            if (front === '_' || front === '.') return next();
          }

          if (renderer.indexOf(extname.substring(1)) !== -1){
            render.compile(sourceDir + item, function(err, result, output){
              if (err) throw err;
              var filename = item.substring(0, item.length - extname.length),
                fileext = path.extname(filename),
                dest = filename + '.' + (fileext ? fileext : output);

              list.push(dest);
              file.write(publicDir + dest, result, next);
            });
          } else {
            list.push(item);
            file.copy(sourceDir + item, publicDir + item, next);
          }
        }, function(err){
          next(err, list);
        });
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
      if (cacheData){
        file.write(baseDir + '.cache', JSON.stringify({theme: cacheData}), next);
      } else {
        next();
      }
    }],
    clear: ['theme_source', function(next, results){
      if (publicExist){
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
    }]
  }, function(err, results){
    if (err) throw err;

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
    }, function(){
      var finish = new Date(),
        elapsed = (finish.getTime() - start.getTime()) / 1000;
      console.log('Site generated in %ss.', elapsed.toFixed(3));
    });
  });
});