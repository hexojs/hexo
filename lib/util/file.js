var fs = require('fs'),
  path = require('path'),
  async = require('async'),
  _ = require('underscore'),
  sep = path.sep;

if (!fs.exists || !fs.existsSync){
  fs.exists = path.exists;
  fs.existsSync = path.existsSync;
}

var mkdir = exports.mkdir = function(destination, callback){
  var parent = path.dirname(destination);

  fs.exists(parent, function(exist){
    if (exist){
      fs.mkdir(destination, callback);
    } else {
      mkdir(parent, function(){
        fs.mkdir(destination, callback);
      });
    }
  });
};

var write = exports.write = function(destination, content, callback){
  var parent = path.dirname(destination);

  fs.exists(parent, function(exist){
    if (exist){
      fs.writeFile(destination, content, callback);
    } else {
      mkdir(parent, function(){
        fs.writeFile(destination, content, callback);
      });
    }
  });
};

var copy = exports.copy = function(source, destination, callback){
  var parent = path.dirname(destination);

  async.series([
    function(next){
      fs.exists(parent, function(exist){
        if (exist) next();
        else mkdir(parent, next);
      });
    }
  ], function(){
    var rs = fs.createReadStream(source),
      ws = fs.createWriteStream(destination);

    rs.pipe(ws)
      .on('error', function(err){
        if (err) throw err;
      });

    ws.on('close', callback)
      .on('error', function(err){
        if (err) throw err;
      });
  });
};

var dir = exports.dir = function(source, callback, parent){
  fs.exists(source, function(exist){
    if (exist){
      fs.readdir(source, function(err, files){
        if (err) throw err;

        var result = [];

        async.forEach(files, function(item, next){
          fs.stat(source + sep + item, function(err, stats){
            if (err) throw err;

            if (stats.isDirectory()){
              dir(source + sep + item, function(children){
                result = result.concat(children);
                next();
              }, (parent ? parent + sep : '') + item);
            } else {
              result.push((parent ? parent + sep : '') + item);
              next();
            }
          });
        }, function(){
          callback(result);
        });
      });
    } else {
      return [];
    }
  });
};

var read = exports.read = function(source, callback){
  fs.exists(source, function(exist){
    if (exist){
      fs.readFile(source, 'utf8', callback);
    } else {
      callback(null);
    }
  });
};

var empty = exports.empty = function(target, exception, callback){
  if (_.isFunction(exception)){
    callback = exception;
    exception = [];
  }

  exception.push('.git');

  fs.readdir(target, function(err, files){
    if (err) throw err;

    var arr = _.map(exception, function(item){
      return item.split(sep)[0];
    });

    async.forEach(files, function(item, next){
      if (_.indexOf(arr, item) !== -1) return next();

      fs.stat(target + sep + item, function(err, stats){
        if (err) throw err;

        if (stats.isDirectory()){
          empty(target + sep + item, function(){
            fs.rmdir(target + sep + item, next);
          });
        } else {
          fs.unlink(target + sep + item, next);
        }
      })
    }, callback);
  });
};