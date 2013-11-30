var async = require('async'),
  path = require('path'),
  fs = require('graceful-fs'),
  util = require('../util'),
  file = util.file2;

var defaults = exports.defaults = {
  normal: [
    'layout: {{ layout }}',
    'title: {{ title }}',
    'date: {{ date }}',
    'tags:',
    '---'
  ].join('\n') + '\n',
  post: [
    'title: {{ title }}',
    'date: {{ date }}',
    'tags:',
    '---'
  ].join('\n') + '\n',
  page: [
    'title: {{ title }}',
    'date: {{ date }}',
    '---'
  ].join('\n') + '\n',
  draft: [
    'title: {{ title }}',
    'tags:',
    '---'
  ].join('\n') + '\n'
};

var _getScaffoldPath = function(layout, callback){
  var scaffoldDir = hexo.scaffold_dir;

  async.waterfall([
    function(next){
      fs.exists(scaffoldDir, function(exist){
        next(null, exist);
      });
    },
    function(exist, next){
      if (!exist) return next(null, null);

      file.list(scaffoldDir, function(err, files){
        if (err) return next(err);

        var scaffoldPath;

        for (var i = 0, len = files.length; i < len; i++){
          var item = files[i];

          if (path.basename(item, path.extname(item)) === layout){
            scaffoldPath = path.join(scaffoldDir, item);
            break;
          }
        }

        next(null, scaffoldPath);
      });
    }
  ], callback);
};

exports.get = function(layout, callback){
  _getScaffoldPath(layout, function(err, scaffoldPath){
    if (err) return callback(err);

    if (scaffoldPath){
      file.readFile(scaffoldPath, callback);
    } else {
      callback(null, defaults[layout] || defaults.normal);
    }
  });
};

exports.create = function(layout, content, callback){
  if (!callback){
    if (typeof content === 'function'){
      callback = content;
      content = defaults.normal
    } else {
      callback = function(){};
    }
  }

  var scaffoldPath = path.join(hexo.scaffold_dir, layout + '.md');

  file.writeFile(scaffoldPath, content, callback);
};

exports.update = function(layout, content, callback){
  if (!callback) callback = function(){};

  _getScaffoldPath(layout, function(err, scaffoldPath){
    if (err) return callback(err);

    file.writeFile(scaffoldPath, content, callback);
  });
};
/* @TODO
exports.list = function(){
  //
};
*/
exports.remove = function(layout, callback){
  if (!callback) callback = function(){};

  _getScaffoldPath(layout, function(err, scaffoldPath){
    if (err) return callback(err);

    if (!scaffoldPath) return callback();

    fs.unlink(scaffoldPath, callback);
  });
};