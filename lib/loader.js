var fs = require('graceful-fs'),
  clc = require('cli-color');

module.exports = function(callback){
  var pluginDir = hexo.plugin_dir;

  if (!hexo.config) return callback();

  fs.exists(pluginDir, function(exist){
    if (exist){
      var plugins = hexo.config.plugins;

      plugins.forEach(function(item){
        try {
          require(pluginDir + item);
        } catch (err){
          console.log(clc.red('Failed to load plugin: ' + clc.bold(item)));
        }
      });

      callback();
    } else {
      callback();
    }
  });
};