var render = require('./render'),
  renderSync = render.renderSync,
  extend = require('./extend'),
  list = Object.keys(extend.renderer.list()),
  helper = extend.helper.list(),
  util = require('./util'),
  file = util.file,
  yfm = util.yfm,
  async = require('async'),
  path = require('path'),
  _ = require('underscore'),
  cache = {};

var config = exports.config = {};

exports.init = function(callback){
  render.compile(hexo.theme_dir + '_config.yml', function(err, file){
    if (err) throw err;

    if (file){
      for (var i in file){
        (function(i){
          config.__defineGetter__(i, function(){
            return file[i];
          });
        })(i);
      }

      callback();
    } else {
      callback();
    }
  });
};

exports.assets = function(callback){
  var themeDir = hexo.theme_dir,
    publicDir = hexo.public_dir;

  file.dir(themeDir, function(files){
    async.forEach(files, function(item, next){
      var extname = path.extname(item),
        dirs = item.split('/');

      for (var i=0, len=dirs.length; i<len; i++){
        var front = dirs[i].substring(0, 1);

        if (front === '_' || front === '.'){
          return next();
        }
      }

      var firstDir = dirs.shift();

      switch (firstDir){
        case 'source':
          if (_.indexOf(list, extname.substring(1)) !== -1){
            render.compile(themeDir + item, function(err, result, output){
              if (err) throw err;
              var filename = dirs.join('/').replace(extname, '.' + output);
              file.write(publicDir + filename, result, next);
            });
          } else {
            file.copy(themeDir + item, publicDir + dirs.join('/'), next);
          }

          break;

        case 'layout':
          file.read(themeDir + item, function(err, content){
            if (err) throw err;

            var filename = path.basename(item, extname);
            cache[filename] = yfm(content);
            cache[filename].source = themeDir + item;
            next();
          });

          break;

        default:
          next();
      }
    }, callback);
  });
};

var renderFn = exports.render = function(template, locals){
  if (_.isFunction(locals)){
    callback = locals;
    locals = {};
  }

  var layout = cache[template],
    extname = path.extname(layout.source).substring(1),
    newHelper = _.clone(helper);

  _.each(newHelper, function(value, key){
    newHelper[key] = value(layout.source, layout.content, locals);
  });

  var newLocals = _.extend(locals, newHelper);

  if (layout.layout){
    var content = renderFn(layout.layout, _.extend(locals, {body: layout._content}));
  } else {
    var content = layout._content;
  }

  var result = renderSync(content, extname, newLocals);

  return result;
};