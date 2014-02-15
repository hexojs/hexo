var path = require('path'),
  fs = require('graceful-fs'),
  async = require('async'),
  util = require('../util'),
  file = util.file2;

exports.statics = {
  loadCache: function(src, callback){
    var source = path.join(hexo.base_dir, src),
      data = this.findOne({source: src}),
      self = this;

    async.auto({
      mtime: function(next){
        fs.stat(source, function(err, stats){
          if (err) return callback(err);

          next(null, stats.mtime.getTime());
        });
      },
      check: ['mtime', function(next, results){
        if (data && data.mtime === results.mtime) return callback(null, data.content);
        next();
      }],
      content: ['check', function(next){
        file.readFile(source, next);
      }],
      save: ['content', function(next, results){
        if (data){
          data.content = results.content;
          data.mtime = results.mtime;

          data.save();
          callback(null, results.content);
        } else {
          self.insert({
            content: results.content,
            mtime: results.mtime,
            source: src
          }, function(){
            callback(null, results.content);
          });
        }
      }]
    });
  }
};