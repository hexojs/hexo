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
    var tasks = [];

    processor.forEach(function(item){
      var rule = item.rule,
        match = false,
        params;

      if (_.isRegExp(rule)){
        var exec = rule.exec(item);
        if (exec){
          params = exec;
          match = true;
        }
      } else {
        if (rule === ''){
          match = true;
        } else {
          var arr = [];
          rule = rule.replace('/', '\\/').replace(/:(\w+)/g, function(match, arg){
            arr.push(arg);
            return '([^\\/]+)';
          });
          var regex = new RegExp(rule),
            exec = regex.exec(item);

          if (exec){
            match = true;
            params = [];
            for (var i=0, len=arr.length; i<len; i++){
              params[arr[i]] = exec[i + 1];
            }
          }
        }
      }

      if (match){
        item.params = params;
        tasks.push(item);
      }
    });

    if (!tasks.length) return next();

    file.read(sourceDir + item, function(err, content){
      if (err) throw new Error('Failed to read file: ' + sourceDir + item);

      async.forEach(tasks, function(task, next){
        var obj = {
          source: sourceDir + item,
          path: item,
          content: content,
          params: task.params
        };

        task(obj, next);
      }, next);
    });
  }, function(){
    hexo.emit('processAfter');
    callback();
  });
};