var fs = require('graceful-fs');

exports.statics = {
  checkModified: function(src, callback){
    var baseDir = hexo.base_dir,
      self = this;

    fs.stat(src, function(err, stats){
      if (err) return callback(err);

      var path = src.substring(baseDir.length),
        data = self.findOne({source: path}),
        mtime = stats.mtime.getTime(),
        modified = true;

      if (data){
        if (data.mtime === mtime){
          modified = false;
        } else {
          data.mtime = mtime;
          data.save();
        }
      } else {
        self.insert({source: path, mtime: mtime});
      }

      callback(null, modified);
    });
  }
};