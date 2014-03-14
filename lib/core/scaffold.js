/**
* Scaffold functions.
*
* @class scaffold
* @since 2.4.0
* @module hexo
* @static
*/

var async = require('async'),
  path = require('path'),
  fs = require('graceful-fs'),
  util = require('../util'),
  file = util.file2;

/**
* Default scaffolds.
*
* @property defaults
* @type Object
* @static
*/

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

/**
* Gets a scaffold.
*
* @method get
* @param {String} layout
* @param {Function} callback
* @async
* @static
*/

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

/**
* Creates a scaffold.
*
* @method create
* @param {String} layout
* @param {String} content
* @param {Function} [callback]
* @async
* @static
*/

exports.create = function(layout, content, callback){
  if (!callback){
    if (typeof content === 'function'){
      callback = content;
      content = defaults.normal;
    } else {
      callback = function(){};
    }
  }

  var scaffoldPath = path.join(hexo.scaffold_dir, layout + '.md');

  file.writeFile(scaffoldPath, content, callback);
};

/**
* Updates the scaffold.
*
* @method update
* @param {String} layout
* @param {String} content
* @param {Function} [callback]
* @async
* @static
*/

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

/**
* Removes a scaffold.
*
* @method remove
* @param {String} layout
* @param {Function} [callback]
* @async
* @static
*/

exports.remove = function(layout, callback){
  if (!callback) callback = function(){};

  _getScaffoldPath(layout, function(err, scaffoldPath){
    if (err) return callback(err);

    if (!scaffoldPath) return callback();

    fs.unlink(scaffoldPath, callback);
  });
};