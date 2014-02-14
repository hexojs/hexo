var fs = require('graceful-fs'),
  path = require('path');

exports.statics = {
  updateStat: function(src, callback){
    var baseDir = hexo.base_dir,
      source = path.join(baseDir, src),
      self = this;

    fs.stat(source, function(err, stats){
      if (err) return callback(err);

      var data = self.findOne({source: src}),
        mtime = stats.mtime.getTime();

      if (data){
        data.mtime = mtime;
        data.modified = data.mtime !== mtime;
        data.save();

        callback(null, data);
      } else {
        self.insert({source: src, mtime: mtime, modified: true}, function(data){
          callback(null, data);
        });
      }
    });
  }
};