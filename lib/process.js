var extend = require('./extend'),
  processor = extend.processor.list(),
  util = require('./util'),
  file = util.file,
  async = require('async'),
  _ = require('underscore'),
  sourceDir = hexo.source_dir;

module.exports = function(files, callback){
  if (!_.isArray(files)) files = [files];

  async.forEach(files, function(item, next){
    file.read(sourceDir + item, function(err, content){
      if (err) throw err;

      var queue = [];

      processor.forEach(function(fn){
        var path = fn.path;
        if (!path || item.match(path)) queue.push(fn);
      });

      async.forEachSeries(queue, function(task, next){
        var obj = {
          path: item,
          source: sourceDir + item,
          content: content
        };

        if (task.path) obj.params = item.match(task.path);

        task(obj, next);
      }, next);
    });
  }, callback);
};