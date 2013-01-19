var async = require('async'),
  _ = require('underscore'),
  extend = require('./extend'),
  processor = extend.processor.list(),
  util = require('./util'),
  file = util.file,
  sourceDir = hexo.source_dir;

module.exports = function(files, callback){
  if (!_.isArray(files)) files = [files];

  hexo.emit('processBefore');

  async.forEach(files, function(item, next){
    file.read(sourceDir + item, function(err, content){
      if (err) throw new Error('Failed to read file: ' + sourceDir + item);

      var tasks = [];

      processor.forEach(function(proc){
        var rule = proc.rule;
        if (rule.exec(item) || rule === '') tasks.push(proc);
      });

      async.forEach(tasks, function(task, next){
        var obj = {
          source: sourceDir + item,
          path: item
        };

        task(obj, content, next);
      }, next);
    });
  }, function(){
    hexo.emit('processAfter');
    callback();
  });
};