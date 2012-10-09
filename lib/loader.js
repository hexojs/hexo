var util = require('./util'),
  file = util.file,
  async = require('async'),
  fs = require('fs');

module.exports = function(callback){
  var pluginDir = hexo.plugin_dir;
  
  fs.exists(pluginDir, function(exist){
    if (exist){
      file.dir(pluginDir, function(files){
        async.forEach(files, function(item, next){
          require(pluginDir + item);
          next(null);
        }, callback);
      })
    } else {
      callback();
    }
  });
};