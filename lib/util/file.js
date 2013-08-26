/**
 * This module is deprecated. Use util.file2 instead!
 */

/**
 * Module dependencies.
 */

var fs = require('graceful-fs'),
  path = require('path'),
  async = require('async'),
  _ = require('lodash'),
  EOL = require('os').EOL,
  EOLre = new RegExp(EOL, 'g');

/**
 * Fallback for Node.js 0.8 or below.
 */

if (!fs.exists || !fs.existsSync){
  fs.exists = path.exists;
  fs.existsSync = path.existsSync;
}

/**
 * Creates the directory in the given `destination`, including any necessary
 * but nonexistent parent directories.
 *
 * @param {String} destination
 * @param {Function} callback
 * @api public
 */

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

/**
 * Writes the `content` to the given `destination`.
 *
 * @param {String} destination
 * @param {String} content
 * @param {Function} callback
 * @api private
 */

var writeFile = function(destination, content, callback) {
  fs.open(destination, "w", function(err, fd) {
    if (err) callback(err);
    fs.write(fd, content, 0, "utf8", function(err, written, buffer) {
      callback(err);
    });
  });
};

/**
 * Writes the `content` to the given `destination`.
 *
 * @param {String} destination
 * @param {String} content
 * @param {Function} callback
 * @api private
 */

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

/**
 * Copies the file from `source` to `destination`.

 * @param {String} source
 * @param {String} destination
 * @param {Function} callback
 * @api public
 */

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

/**
 * Lists all files in the given `source`.
 *
 * @param {String} source
 * @param {Function} callback
 * @param {String} parent
 * @api public
 */

var dir = exports.dir = function(source, callback, parent){
  fs.exists(source, function(exist){
    if (exist){
      fs.readdir(source, function(err, files){
        if (err) throw err;

        var result = [];

        async.forEach(files, function(item, next){
          fs.stat(source + '/' + item, function(err, stats){
            if (err) throw err;

            if (stats.isDirectory()){
              dir(source + '/' + item, function(children){
                result = result.concat(children);
                next();
              }, (parent ? parent + '/' : '') + item);
            } else {
              result.push((parent ? parent + '/' : '') + item);
              next();
            }
          });
        }, function(){
          callback(result);
        });
      });
    } else {
      callback([]);
    }
  });
};

/**
 * Transforms EOL and remove UTF BOM in the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

var textProcess = function(str){
  // Transform EOL
  var str = EOL === '\n' ? str : str.replace(EOLre, '\n');

  // Remove UTF BOM
  str = str.replace(/^\uFEFF/, '');

  return str;
};

/**
 * Reads the file from the given `source`.
 *
 * @param {String} source
 * @param {Function} callback
 * @api public
 */

var read = exports.read = function(source, callback){
  fs.exists(source, function(exist){
    if (exist){
      fs.readFile(source, 'utf8', function(err, result){
        if (err) return callback(err);
        callback(null, textProcess(result));
      });
    } else {
      callback(null);
    }
  });
};

/**
 * Reads the file from the given `source` synchronously.
 *
 * @param {String} source
 * @return {String}
 * @api public
 */

var readSync = exports.readSync = function(source){
  var result = fs.readFileSync(source, 'utf8');
  if (result){
    return textProcess(result);
  }
};

/**
 * Clears a directory.
 *
 * @param {String} target
 * @param {Array} exception
 * @param {Function} callback
 * @api public
 */

var empty = exports.empty = function(target, exception, callback){
  if (_.isFunction(exception)){
    callback = exception;
    exception = [];
  }

  if (!Array.isArray(exception)) exception = [];
  if (target.substr(target.length - 1, 1) !== '/') target += '/';

  var arr = [],
    exclude = {};

  exception.forEach(function(item){
    var split = item.split('/'),
      front = split.shift();

    arr.push(front);
    if (!exclude[front]) exclude[front] = [];
    if (split.length) exclude[front].push(split.join('/'));
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
