var fs = require('graceful-fs'),
  path = require('path');

exports.statics = {
  updateStat: function(post, name, callback){
    var source = path.join(post.asset_dir, name),
      self = this;

    fs.stat(source, function(err, stats){
      if (err) return callback(err);

      var data = self.findOne({post: post._id, name: name}),
        mtime = stats.mtime.getTime();

      if (data){
        data.mtime = mtime;
        data.modified = data.mtime !== mtime;
        data.save();

        callback(null, data);
      } else {
        self.insert({name: name, post: post._id, mtime: mtime, modified: true}, function(data){
          callback(null, data);
        });
      }
    });
  }
};