var async = require('async'),
  fs = require('graceful-fs'),
  path = require('path'),
  util = require('../../util'),
  file = util.file2;

module.exports = function(args, callback){
  if (!hexo.env.init) return callback();

  var log = hexo.log;

  async.parallel([
    function(next){
      var cachePath = path.join(hexo.base_dir, 'db.json');

      fs.exists(cachePath, function(exist){
        if (!exist) return next();

        fs.unlink(cachePath, function(err){
          if (err) return next(err);

          log.i('Deleted cache file');
          next();
        });
      });
    },
    function(next){
      var publicDir = hexo.public_dir;

      fs.exists(publicDir, function(exist){
        if (!exist) return next();

        file.rmdir(publicDir, function(err){
          if (err) return next(err);

          log.i('Deleted public directory');
          next();
        });
      });
    }
  ], callback);
};