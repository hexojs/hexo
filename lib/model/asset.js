var fs = require('graceful-fs'),
  path = require('path');

exports.statics = {
  checkModified: function(src, callback){
    var baseDir = hexo.base_dir,
      source = path.join(baseDir, src),
      self = this;

    fs.stat(source, function(err, stats){
      if (err) return callback(err);

      var data = self.findOne({source: src}),
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
        self.insert({source: src, mtime: mtime});
      }

      callback(null, modified);
    });
  }
};