var async = require('async'),
  fs = require('graceful-fs'),
  mime = require('mime'),
  pathFn = require('path'),
  sourceDir = hexo.source_dir;

exports.list = function(req, res, next){
  var name = req.params[0],
    path = pathFn.join(sourceDir, req.params[0]);

  async.waterfall([
    function(next){
      fs.exists(path, function(exist){
        if (!exist) return res.send(404);
        next();
      });
    },
    function(next){
      fs.readdir(path, function(err, files){
        if (err) return next(err);

        var arr = [];

        async.forEach(files, function(i, next){
          // Ignore hidden files
          if (/^\./.test(i)) return next();

          var source = pathFn.join(path, i);

          fs.stat(source, function(err, stats){
            if (err) return next(err);

            var isDir = stats.isDirectory();

            var obj = {
              name: i,
              path: source.substring(sourceDir.length),
              is_dir: isDir,
              ctime: stats.ctime.getTime(),
              mtime: stats.mtime.getTime()
            };

            if (!isDir){
              obj.size = stats.size;
              obj.mime = mime.lookup(i);
            }

            arr.push(obj);
            next();
          });
        }, function(err){
          if (err) return next(err);

          res.json(arr);
        });
      });
    }
  ]);
};

exports.show = function(req, res, next){
  var name = req.params[0],
    path = pathFn.join(sourceDir, req.params[0]);

  async.auto({
    exist: function(next){
      fs.exists(path, function(exist){
        if (!exist) return res.send(404);
        next();
      });
    },
    stats: ['exist', function(next){
      fs.stat(path, next);
    }],
    content: ['exist', function(next){
      fs.readFile(path, 'utf8', next);
    }]
  }, function(err, results){
    if (err) return next(err);

    var stats = results.stats;

    res.json({
      name: name,
      path: path.substring(sourceDir.length),
      content: results.content,
      size: stats.size,
      ctime: stats.ctime.getTime(),
      mtime: stats.mtime.getTime(),
      mime: mime.lookup(name)
    });
  });
};

exports.download = function(req, res, next){
  var name = req.params[0],
    path = pathFn.join(sourceDir, req.params[0]);

  fs.exists(path, function(exist){
    if (!exist) return res.send(404);

    res.download(path);
  });
};

exports.newFolder = function(req, res, next){
  //
};

exports.upload = function(req, res, next){
  //
};

exports.update = function(req, res, next){
  //
};

exports.destroy = function(req, res, next){
  //
};