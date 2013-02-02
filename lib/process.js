var async = require('async'),
  _ = require('underscore'),
  fs = require('graceful-fs'),
  extend = require('./extend'),
  processor = extend.processor.list(),
  sourceDir = hexo.source_dir,
  EOL = require('os').EOL,
  EOLre = new RegExp(EOL, 'g');

var getProcessor = function(path){
  var tasks = [];

  processor.forEach(function(item){
    var rule = item.rule,
      match = false,
      params = [];

    var obj = {
      fn: item,
      rule: item.rule
    };

    if (_.isRegExp(rule)){
      var exec = rule.exec(path);
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
          exec = regex.exec(path);

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
      obj.params = params;
      tasks.push(obj);
    }
  });

  return tasks;
};

module.exports = function(files, callback){
  if (!_.isArray(files)) files = [files];

  hexo.emit('processBefore');

  async.forEach(files, function(item, next){
    if (_.isObject(item)){
      var path = item.path,
        type = item.type;
    } else {
      var path = item,
        type = 'update';
    }

    var tasks = getProcessor(path);

    if (!tasks.length) return next();

    fs.readFile(sourceDir + path, function(err, data){
      if (err) throw new Error('Failed to read file: ' + sourceDir + path);

      var content = data.toString('utf8');

      async.forEach(tasks, function(task, next){
        var obj = {
          source: sourceDir + path,
          path: path,
          buffer: data,
          content: EOL === '\n' ? content : content.replace(EOLre, '\n'),
          params: task.params,
          type: type
        };

        task.fn(obj, next);
      }, next);
    });
  }, function(){
    hexo.emit('processAfter');
    callback();
  });
};