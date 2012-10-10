var fs = require('fs'),
  path = require('path'),
  async = require('async');

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
  var parent = path.dirname(destination),
    read = fs.createReadStream(source);

  fs.exists(parent, function(exist){
    if (exist){
      var write = fs.createWriteStream(destination);
      read.pipe(write);
      read.on('end', callback);
    } else {
      mkdir(parent, function(){
        var write = fs.createWriteStream(destination);
        read.pipe(write);
        read.on('end', callback);
      });
    }
  })
};

var dir = exports.dir = function(source, callback, parent){
  fs.exists(source, function(exist){
    if (exist){
      fs.readdir(source, function(err, files){
        if (err) throw err;

        var result = [];

        async.forEach(files, function(item, next){
          var extname = path.extname(item);

          if (extname === ''){
            fs.stat(source + '/' + item, function(err, stats){
              if (err) throw err;

              if (stats.isDirectory()){
                dir(source + '/' + item, function(children){
                  result = result.concat(children);
                  next(null);
                }, (parent ? parent + '/' : '') + item);
              } else {
                result.push((parent ? parent + '/' : '') + item);
                next(null);
              }
            });
          } else {
            result.push((parent ? parent + '/' : '') + item);
            next(null);
          }
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

var empty = exports.empty = function(target, callback){
  fs.readdir(target, function(err, files){
    if (err) throw err;

    async.forEach(files, function(item, next){
      if (item === '.git') return next();

      fs.stat(target + '/' + item, function(err, stats){
        if (err) throw err;

        if (stats.isDirectory()){
          empty(target + '/' + item, next);
        } else {
          fs.unlink(target + '/' + item, next);
        }
      });
    }, callback);
  });
};