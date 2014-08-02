var async = require('async'),
  fs = require('graceful-fs'),
  path = require('path'),
  moment = require('moment'),
  swig = require('swig'),
  util = require('../util'),
  file = util.file2,
  yfm = util.yfm,
  escape = util.escape;

var preservedKeys = ['title', 'slug', 'path', 'layout', 'date', 'content'];

swig.setDefaults({
  autoescape: false
});

/**
* Creates a new post.
*
* @method create
* @param {Object} data
*   @param {String} data.title Post title
*   @param {String} [data.slug] Post slug. If not defined, the value will be escaped `data.title`.
*   @param {String} [data.path] Post path. If not defined, the value will be `data.slug`.
*   @param {String} [data.layout] Post layout. If not defined, the value will be `default_layout` in global configuration.
*   @param {Date} [data.date] Post date. If not defined, the value will be `Date.now()`.
*   @param {String} [data.content] Post content.
* @param {Boolean} [replace=false] Determines whether to replace existing data.
* @param {Function} callback
* @for post
* @static
*/

module.exports = function(data, replace, callback){
  if (!callback){
    if (typeof replace === 'function'){
      callback = replace;
      replace = false;
    } else {
      callback = function(){};
    }
  }

  var config = hexo.config,
    slug = data.slug = escape.filename(data.slug || data.title, config.filename_case),
    layout = data.layout = (data.layout || config.default_layout).toLowerCase(),
    date = data.date = data.date ? moment(data.date) : moment();

  async.auto({
    filename: function(next){
      hexo.extend.filter.apply('new_post_path', [data, replace], function(err, results){
        if (err) return next(err);
        next(null, results[results.length - 1]);
      });
    },
    scaffold: function(next){
      hexo.scaffold.get(layout, function(err, result){
        if (err) return next(err);
        if (result != null) return next(null, result);

        hexo.scaffold.get('normal', next);
      });
    },
    content: ['filename', 'scaffold', function(next, results){
      data.title = '"' + data.title + '"';
      data.date = date.format('YYYY-MM-DD HH:mm:ss');

      var split = yfm.split(results.scaffold),
        frontMatter = swig.compile(split.data)(data),
        compiled = yfm([frontMatter, '---', split.content].join('\n'));

      for (var i in data){
        if (!~preservedKeys.indexOf(i)){
          compiled[i] = data[i];
        }
      }

      if (data.content){
        compiled._content += '\n' + data.content;
      }

      var content = yfm.stringify(compiled);

      file.writeFile(results.filename, content, function(err){
        if (err) return callback(err);

        next(null, content);
      });
    }],
    folder: ['filename', function(next, results){
      if (!config.post_asset_folder) return next();

      var filename = results.filename,
        target = filename.substring(0, filename.length - path.extname(filename).length);

      fs.exists(target, function(exist){
        if (exist){
          file.rmdir(target, function(err){
            if (err) return next(err);

            file.mkdirs(target, next);
          });
        } else {
          file.mkdirs(target, next);
        }
      });
    }],
    event: ['filename', 'content', 'folder', function(next, results){
      /**
      * Fired when a new post created.
      *
      * @event new
      * @param {String} path The full path of the new post
      * @param {String} content The content of the new post
      * @for Hexo
      */
      hexo.emit('new', results.filename, results.content);
      next();
    }]
  }, function(err, results){
    if (err) return callback(err);

    callback(null, results.filename, results.content);
  });
};