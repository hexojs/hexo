var extend = require('./extend'),
  renderer = extend.renderer.list(),
  helper = extend.helper.list(),
  i18n = require('./i18n').i18n,
  render = require('./render'),
  renderSync = render.renderSync,
  route = require('./route'),
  util = require('./util'),
  file = util.file,
  yfm = util.yfm,
  async = require('async'),
  fs = require('fs'),
  path = require('path'),
  sep = path.sep,
  _ = require('underscore'),
  baseDir = hexo.base_dir,
  themeDir = hexo.theme_dir,
  cache = {};

exports.layout = function(callback){
  var layoutDir = themeDir + 'layout' + sep;

  file.dir(layoutDir, function(files){
    async.forEach(files, function(item, next){
      var extname = path.extname(item),
        dirs = item.split(sep);

      for (var i=0, len=dirs.length; i<len; i++){
        var front = dirs[i].substr(0, 1);
        if (front === '_' || front === '.') return next();
      }

      file.read(layoutDir + item, function(err, content){
        if (err) throw new Error('Failed to read file: ' + layoutDir + item);

        var name = item.substring(0, item.length - extname.length);
        cache[name] = yfm(content);
        cache[name].source = layoutDir + item;
        next();
      });
    }, callback);
  });
};

exports.source = function(callback){
  var rendererList = Object.keys(renderer),
    compile = render.compile;

  // Load source
  async.waterfall([
    function(next){
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
              compile(sourceDir + item, function(err, result){
                if (err) throw new Error('Failed to compile file: ' + sourceDir + item);
                func(null, result);
              });
            })
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
    },
    // Save cache
    function(list, next){
      var cachePath = baseDir + '.cache';

      file.read(cachePath, function(err, content){
        if (err) throw new Error('Failed to read cache.');

        var newContent = JSON.parse(content);
        newContent.theme = list;

        file.write(cachePath, JSON.stringify(newContent), function(err){
          if (err) throw new Error('Failed to write cache.');
          next(null, list);
        })
      });
    }
  ], callback);
};

exports.i18n = function(callback){
  var langDir = themeDir + 'languages';

  fs.exists(langDir, function(exist){
    if (exist){
      var theme_i18n = new i18n();
      theme_i18n.load(langDir, function(){
        callback(null, theme_i18n);
      });
    } else {
      callback();
    }
  });
};

var themeRender = exports.render = function(template, locals){
  if (!cache[template]) return '';

  var layout = cache[template],
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