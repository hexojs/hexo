var fs = require('graceful-fs'),
  path = require('path'),
  async = require('async'),
  util = require('../util'),
  file = util.file2,
  HexoError = require('../error');

var loadScript = function(scriptDir, callback){
  fs.exists(scriptDir, function(exist){
    if (!exist) return callback();

    file.list(scriptDir, function(err, files){
      if (err) return hexo.log.e(HexoError.wrap(err, 'Script load failed'));

      files.forEach(function(item){
        try {
          require(path.join(scriptDir, item));
          hexo.log.d('Script load successfully: ' + item);
        } catch (err){
          hexo.log.e(HexoError.wrap(err, 'Script load failed: ' + item));
        }
      });

      callback();
    });
  });
};

module.exports = function(callback){
  if (!hexo.env.init || hexo.env.safe) return callback();

  async.series([
    function(next){
      loadScript(hexo.script_dir, next);
    },
    function(next){
      loadScript(hexo.theme_script_dir, next);
    }
  ], callback);
};