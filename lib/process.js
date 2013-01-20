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

      var tasks = [],
        params;

      processor.forEach(function(proc){
        var rule = proc.rule;

        if (rule.exec(item)){
          params = rule.exec(item);
          tasks.push(proc);
        } else if (rule === ''){
          tasks.push(proc);
        }
      });

      async.forEach(tasks, function(task, next){
        var obj = {
          source: sourceDir + item,
          path: item,
          content: content
        };

        if (params) obj.params = params;

        task(obj, next);
      }, next);
    });
  }, function(){
    hexo.emit('processAfter');
    callback();
  });
};