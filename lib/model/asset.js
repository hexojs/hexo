var fs = require('graceful-fs'),
  baseDir = hexo.base_dir,
  model = hexo.model;

model.extend('Asset', {
  checkModified: function(source, callback){
    var self = this;

    fs.stat(source, function(err, stats){
      if (err) return callback(err);

      var path = source.substring(baseDir.length),
        data = self.findOne({source: path}),
        mtime = stats.mtime.getTime(),
        modified = true;

      if (data){
        if (data.mtime === mtime){
          modified = false;
        } else {
          self.update(data._id, {mtime: mtime});
        }
      } else {
        self.insert({source: path, mtime: mtime});
      }

      callback(null, modified);
    });
  }
});