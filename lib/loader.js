var fs = require('fs'),
  clc = require('cli-color'),
  _ = require('underscore');

module.exports = function(callback){
  var pluginDir = hexo.plugin_dir;
  
  if (!hexo.config) return callback();

  fs.exists(pluginDir, function(exist){
    if (exist){
      var plugins = hexo.config.plugins;

      _.each(plugins, function(item){
        try {
          require(pluginDir + item);
        } catch (e){
          console.log(clc.red('Failed to load plugin: ' + clc.bold(item)));
        }
      });

      callback();
    } else {
      callback();
    }
  });
};