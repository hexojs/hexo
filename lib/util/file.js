var fs = require('graceful-fs'),
  path = require('path'),
  async = require('async'),
  _ = require('underscore'),
  sep = path.sep,
  EOL = require('os').EOL,
  EOLre = new RegExp(EOL, 'g');

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
      fs.readFile(source, 'utf8', function(err, file){
        if (err) return callback(err);
        callback(null, EOL === '\n' ? file : file.replace(EOLre, '\n'));
      });
    } else {
      callback(null);
    }
  });
};

var readSync = exports.readSync = function(source){
  var result = fs.readFileSync(source, 'utf8');
  if (result){
    if (EOL !== '\n') result = result.replace(EOLre, '\n');
    return result;
  }
};

var empty = exports.empty = function(target, exception, callback){
  if (_.isFunction(exception)){
    callback = exception;
    exception = [];
  }

  if (!_.isArray(exception)) exception = [];
  if (target.substr(target.length - 1, 1) !== sep) target += sep;

  var arr = [],
    exclude = {};

  exception.forEach(function(item){
    var split = item.replace(/\//g, sep).split(sep),
      front = split.shift();

    arr.push(front);
    if (!exclude[front]) exclude[front] = [];
    if (split.length) exclude[front].push(split.join(sep));
  });

  fs.readdir(target, function(err, files){
    if (err) throw err;

    files = _.filter(files, function(item){
      return item.substr(0, 1) !== '.';
    });

    async.forEach(files, function(item, next){
      var dest = target + item;

      fs.stat(dest, function(err, stats){
        if (err) throw err;

        if (stats.isDirectory()){
          empty(dest, exclude[item], function(){
            fs.readdir(dest, function(err, files){
              if (err) throw err;

              if (files.length === 0) fs.rmdir(dest, next);
              else next();
            });
          });
        } else {
          if (arr.indexOf(item) === -1) fs.unlink(dest, next);
          else next();
        }
      });
    }, callback);
  });
};