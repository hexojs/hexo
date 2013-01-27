var async = require('async'),
  _ = require('underscore'),
  fs = require('graceful-fs'),
  extend = require('./extend'),
  processor = extend.processor.list(),
  sourceDir = hexo.source_dir,
  EOL = require('os').EOL,
  EOLre = new RegExp(EOL, 'g');

module.exports = function(files, callback){
  if (!_.isArray(files)) files = [files];

  hexo.emit('processBefore');

  async.forEach(files, function(item, next){
    var tasks = [];

    processor.forEach(function(prop){
      var rule = prop.rule,
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
        prop.params = params;
        tasks.push(prop);
      }
    });

    if (!tasks.length) return next();

    fs.readFile(sourceDir + item, function(err, data){
      if (err) throw new Error('Failed to read file: ' + sourceDir + item);

      var content = data.toString('utf8');

      async.forEach(tasks, function(task, next){
        var obj = {
          source: sourceDir + item,
          path: item,
          buffer: data,
          content: EOL === '\n' ? content : content.replace(EOLre, '\n'),
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