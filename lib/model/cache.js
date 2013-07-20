/**
 * Module dependencies.
 */

var async = require('async'),
  fs = require('graceful-fs'),
  util = require('../util'),
  file = util.file2,
  sourceDir = hexo.source_dir,
  model = hexo.model;

/**
 * Register `Cache` model.
 */

model.extend('Cache', {

  /**
   * Load and save cache for the given `path`.
   *
   * @param {String} path
   * @param {Function} callback
   * @api public
   */

  loadCache: function(path, callback){
    var source = sourceDir + path,
      data = this.findOne({source: path}) || {},
      self = this;

    async.auto({
      mtime: function(next){
        fs.stat(source, function(err, stats){
          if (err) return callback(err);

          next(null, stats.mtime.getTime());
        });
      },
      check: ['mtime', function(next, results){
        if (data.mtime && data.mtime == results.mtime) return callback(null, data);

        next();
      }],
      content: ['check', function(next){
        file.readFile(source, next);
      }],
      save: ['content', function(next, results){
        data.content = results.content;
        data.mtime = results.mtime;
        data.source = path;

        if (data._id){
          self.update(data._id, data);
          callback(null, data);
        } else {
          self.insert(data, function(data){
            callback(null, data);
          });
        }
      }]
    });
  }
});