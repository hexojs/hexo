var fs = require('graceful-fs'),
  async = require('async'),
  path = require('path'),
  HexoError = require('../error');

module.exports = function(callback){
  if (!hexo.env.init || hexo.env.safe) return callback();

  var pluginDir = hexo.plugin_dir;

  async.series([
    function(next){
      fs.exists(pluginDir, function(exist){
        if (exist){
          next();
        } else {
          callback();
        }
      });
    },
    function(next){
      fs.readdir(pluginDir, function(err, files){
        if (err) return hexo.log.e(HexoError.wrap(err, 'Plugin load failed'));

        files.forEach(function(item){
          if (!/^hexo-/.test(item)) return;

          try {
            require(path.join(pluginDir, item));
            hexo.log.d('Plugin loaded successfully: ' + item);
          } catch (err){
            hexo.log.e(HexoError.wrap(err, 'Plugin load failed: ' + item));
          }
        });

        next();
      });
    }
  ], callback);
};