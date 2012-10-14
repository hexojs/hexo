var fs = require('fs'),
  clc = require('cli-color'),
  _ = require('underscore');

module.exports = function(callback){
  var pluginDir = hexo.plugin_dir;
  
  fs.exists(pluginDir, function(exist){
    if (exist){
      var plugins = hexo.config.plugins;

      _.each(plugins, function(item){
        try {
          require(pluginDir + item);
        } catch (e){
          console.log('Failed to load plugin: %s', clc.bold(item));
        }
      });

      callback();
    } else {
      callback();
    }
  });
};