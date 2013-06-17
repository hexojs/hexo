var async = require('async'),
  fs = require('graceful-fs'),
  util = require('../util'),
  file = util.file2,
  sourceDir = hexo.source_dir,
  model = hexo.model;

model.extend('Cache', {
  loadCache: function(path, callback){
    var source = sourceDir + path,
      data = this.findOne({source: path}),
      self = this;

    async.auto({
      stat: function(next){
        fs.stat(source, next);
      },
      modified: ['stat', function(next, results){
        if (data && results.stat.mtime.getTime() == data.mtime) return callback(null, data);

        next();
      }],
      content: ['modified', function(next){
        file.readFile(source, next);
      }],
      save: ['content', function(next, results){
        if (data){
          var content = data.content = results.content;
          var mtime = data.mtime = results.stat.mtime.getTime();

          self.update(data._id, {content: content, mtime: mtime});
          callback(null, data);
        } else {
          var data = {
            content: results.content,
            mtime: results.stat.mtime.getTime(),
            source: path
          };

          self.insert(data);
          callback(null, data);
        }
      }]
    });

    return this;
  }
});