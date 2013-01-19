var _ = require('underscore'),
  process = require('./process'),
  util = require('./util'),
  file = util.file,
  sourceDir = hexo.source_dir;

module.exports = function(options, callback){
  file.dir(sourceDir, function(files){
    files = _.filter(files, function(item){
      return item.substring(0, 1) !== '.';
    });

    process(files, callback);
  });
};