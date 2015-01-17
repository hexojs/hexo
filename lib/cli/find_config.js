var Promise = require('bluebird');
var pathFn = require('path');
var fs = require('hexo-fs');

module.exports = function(cwd, args){
  if (args.config) return Promise.resolve();

  return findConfigFile(cwd);
};

function findConfigFile(path){
  return fs.readdir(path).then(function(files){
    for (var i = 0, len = files.length; i < len; i++){
      if (files[i].substring(0, 8) === '_config.') return path;
    }

    var parent = pathFn.dirname(path);
    if (parent === path) return;

    return findConfigFile(parent);
  });
}