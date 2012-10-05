var render = require('./render'),
  renderer = Object.keys(require('./extend').renderer.list()),
  partial = require('./partial'),
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
        filename = path.basename(item, extname),
        dirs = item.split('/');

      for (var i=0, len=dirs.length; i<len; i++){
        var front = dirs[i].substring(0, 1);
        if (front === '_' || front === '.'){
          return next(null);
        }
      }

      if (dirs[0] === 'layout'){
        file.read(themeDir + item, function(err, file){
          if (err) throw err;
          cache[filename] = yfm(file);
          cache[filename].source = themeDir + item;
          next(null);
        });
      } else {
        if (_.indexOf(renderer, extname.substring(1)) !== -1){
          render.compile(themeDir + item, function(err, result, output){
            if (err) throw err;
            var outputFile = output ? item.replace(extname, '.' + output) : item;
            file.write(publicDir + outputFile, result, next);
          });
        } else {
          file.copy(themeDir + item, publicDir + item);
          next(null);
        }
      }
    }, callback);
  })
};

exports.render = function(template, locals, callback){
  if (_.isFunction(locals)){
    callback = locals;
    locals = {};
  }

  var layout = cache[template],
    body = partial.render(layout.source, layout._content, locals);

  if (layout.layout && cache.hasOwnProperty(layout.layout)){
    var parent = cache[layout.layout];

    var newLocals = _.clone(locals);
    newLocals.body = body;

    var content = partial.render(parent.source, parent._content, newLocals);
  } else {
    var content = body;
  }

  callback(null, content);
};