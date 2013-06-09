var fs = require('graceful-fs'),
  baseDir = hexo.base_dir;

hexo.model.extend('assets', {
  checkModified: function(source, callback){
    var self = this;

    fs.stat(source, function(err, stats){
      if (err) return callback(err);

      var path = source.substring(baseDir.length),
        data = self.findOne({source: path}),
        mtime = stats.mtime,
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