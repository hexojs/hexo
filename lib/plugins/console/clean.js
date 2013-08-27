var async = require('async'),
  fs = require('graceful-fs'),
  util = require('../../util'),
  file = util.file2;

module.exports = function(args, callback){
  if (!hexo.init) return callback();

  var log = hexo.log;

  async.parallel([
    function(next){
      var cachePath = hexo.base_dir + 'db.json';

      fs.exists(cachePath, function(exist){
        if (!exist) return next();

        fs.unlink(cachePath, function(err){
          if (err) return next(err);

          log.i('Deleted cache file');
        });
      });
    },
    function(next){
      var publicDir = hexo.base_dir + 'public';

      fs.exists(publicDir, function(exist){
        if (!exist) return next();

        file.rmdir(publicDir, function(err){
          if (err) return next(err);

          log.i('Deleted public directory');
        });
      });
    }
  ], callback);
};