var fs = require('graceful-fs'),
  util = require('../util'),
  file = util.file2,
  sourceDir = hexo.source_dir;

hexo.model.extend('cache', {
  loadCache: function(path, callback){
    var source = sourceDir + path,
      self = this;

    fs.stat(source, function(err, stats){
      if (err) return callback(err);

      var data = self.findOne({source: path}),
        mtime = stats.mtime,
        modified = true;

      if (data && data.mtime === mtime) return callback(null, data);

      file.readFile(source, function(err, content){
        if (err) return callback(err);

        if (data){
          self.update(data._id, {content: content, mtime: mtime});
        } else {
          self.insert({source: path, content: content, mtime: mtime});
        }

        callback(null, data);
      });
    });
  }
});