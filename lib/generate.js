var extend = require('./extend'),
  generator = extend.generator.list(),
  processor = extend.processor.list(),
  render = require('./render'),
  process = require('./process'),
  util = require('./util'),
  file = util.file,
  model = require('./model'),
  Collection = model.Collection,
  Taxonomy = model.Taxonomy,
  async = require('async'),
  fs = require('fs'),
  path = require('path'),
  sep = path.sep,
  config = hexo.config,
  baseDir = hexo.base_dir,
  publicDir = hexo.public_dir,
  sourceDir = hexo.source_dir,
  themeDir = hexo.theme_dir,
  _ = require('underscore');

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

module.exports = function(options, callback){
  var theme = require('./theme'),
    preview = options.preview,
    watch = options.watch,
    ignore = options.ignore,
    publicExist = false;

  async.auto({
    load: function(next){
      render.compile(themeDir + '_config.yml', next);
    },
    check: function(next){
      if (preview) return next();

      fs.exists(publicDir, function(exist){
        publicExist = exist;
        next();
      });
    },
    cache: ['check', function(next){
      if (ignore && publicExist && !preview){
        fs.exists(baseDir + '.cache', function(exist){
          if (exist){
            file.read(baseDir + '.cache', function(err, content){
              next(null, JSON.parse(content));
            });
          } else {
            ignore = false;
            next();
          }
        });
      } else {
        next();
      }
    }],
    theme_layout: function(next){
      theme.layout(next);
    },
    theme_i18n: function(next){
      theme.i18n(next);
    },
    theme_source: ['check', 'cache', function(next){
      if (ignore && publicExist) return next();
      theme.source(next);
    }],
    process: function(next){
      var site = hexo.site = {
        posts: new Collection(),
        pages: new Collection()
      };

      file.dir(sourceDir, function(files){
        var arr = [];

        files.forEach(function(item){
          var dirs = item.split(sep);

          for (var i=0, len=dirs.length; i<len; i++){
            var front = dirs[i].substr(0, 1);
            if (front === '.') return;
          }

          arr.push(item);
        });

        process(arr, function(){
          var cats = {},
            tags = {};

          var posts = site.posts = site.posts.sort('date', -1);
          site.pages = site.pages.sort('date', -1);

          posts.each(function(item, i){
            if (item.categories){
              _.each(item.categories, function(cat){
                if (cats.hasOwnProperty(cat.name)){
                  cats[cat.name].push(item);
                } else {
                  var newCat = posts.slice(i, i + 1);
                  newCat.path = cat.path;
                  newCat.permalink = cat.permalink;
                  cats[cat.name] = newCat;
                }
              })
            }

            if (item.tags){
              _.each(item.tags, function(tag){
                if (tags.hasOwnProperty(tag.name)){
                  tags[tag.name].push(item);
                } else {
                  var newTag = posts.slice(i, i + 1);
                  newTag.path = tag.path;
                  newTag.permalink = tag.permalink;
                  tags[tag.name] = newTag;
                }
              });
            }
          });

          site.categories = new Taxonomy(cats).sort('name');
          site.tags = new Taxonomy(tags).sort('name');

          next();
        });
      });
    },
    generate: ['load', 'theme_layout', 'process', function(next, results){
      var site = hexo.site = freeze(hexo.site),
        themeConfig = freeze(results.load[0]),
        i18n = results.theme_i18n ? results.theme_i18n.get : null,
        themeRender = theme.render,
        urlConfig = config.url,
        rootConfig = config.root;

      async.forEach(generator, function(item, next){
        item(site, function(layout, path, locals){
          var newLocals = {
            page: locals,
            site: site,
            config: config,
            theme: themeConfig,
            __: i18n
          };

          return themeRender(layout, newLocals);
        }, next);
      }, next);
    }]
  }, function(err, results){
    callback(err, ignore ? results.cache.theme : results.theme_source);
  });
};