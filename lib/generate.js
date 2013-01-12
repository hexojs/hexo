var extend = require('./extend'),
  generator = extend.generator.list(),
  processor = extend.processor.list(),
  render = require('./render'),
  util = require('./util'),
  file = util.file,
  async = require('async'),
  fs = require('fs'),
  config = hexo.config,
  baseDir = hexo.base_dir,
  publicDir = hexo.public_dir,
  themeDir = hexo.theme_dir,
  urlConfig = config.url,
  rootConfig = config.root,
  _ = require('underscore'),
  publicExist = false,
  themeConfig = {},
  themeCache = [],
  themei18n;

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
    themeRender = theme.render,
    preview = options.preview,
    watch = options.watch,
    ignore = options.ignore;

  async.auto({
    load: function(next){
      if (watch) return next();

      fs.exists(themeDir + '_config.yml', function(exist){
        if (exist){
          render.compile(themeDir + '_config.yml', function(err, result){
            if (err) throw new Error('Failed to load theme config');
            themeConfig = freeze(result);
            next();
          });
        } else {
          next();
        }
      });
    },
    check: function(next){
      if (preview || watch) return next();

      fs.exists(publicDir, function(exist){
        publicExist = exist;
        next();
      });
    },
    cache: ['check', function(next){
      if (ignore && publicExist && !preview && !watch){
        themeCache = hexo.cache.get('theme');
        if (!themeCache) ignore = false;
      }

      next();
    }],
    theme_layout: function(next){
      if (watch) return next();
      theme.layout(next);
    },
    theme_i18n: function(next){
      if (watch) return next();

      theme.i18n(function(err, result){
        if (err) throw new Error('Failed to theme i18n');
        if (result) themei18n = result.get;
        next();
      });
    },
    theme_source: ['check', 'cache', function(next){
      if ((ignore && publicExist) || watch) return next();

      theme.source(function(err, cache){
        themeCache = cache;
        next();
      });
    }],
    process: function(next){
      var site = {};

      async.forEachSeries(processor, function(item, next){
        item(site, function(err, locals){
          if (err) throw err;
          if (locals) site = locals;
          next();
        });
      }, function(){
        next(null, site);
      });
    },
    generate: ['load', 'theme_layout', 'process', function(next, results){
      var site = freeze(results.process);

      async.forEach(generator, function(item, next){
        item(site, function(layout, locals){
          var newLocals = {
            page: locals,
            site: site,
            config: config,
            theme: themeConfig,
            __: themei18n
          };

          return themeRender(layout, newLocals);
        }, next);
      }, next);
    }]
  }, function(err, results){
    callback(err, themeCache);
  });
};