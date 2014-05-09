/**
* File utilities.
*
* @class file2
* @namespace util
* @module hexo
* @static
*/

var fs = require('graceful-fs'),
  pathFn = require('path'),
  async = require('async'),
  _ = require('lodash'),
  chokidar = require('chokidar'),
  EOL = require('os').EOL,
  EOLre = new RegExp(EOL, 'g');

if (!fs.exists || !fs.existsSync){
  fs.exists = pathFn.exists;
  fs.existsSync = pathFn.existsSync;
}

var join = function(parent, child){
  return parent ? pathFn.join(parent, child) : child;
};

/**
* Creates a directory recursively.
*
* @method mkdirs
* @param {String} path
* @param {Function} callback
* @async
* @static
*/

var mkdirs = exports.mkdirs = function(path, callback){
  var parent = pathFn.dirname(path);

  fs.exists(parent, function(exist){
    if (exist){
      fs.mkdir(path, callback);
    } else {
      mkdirs(parent, function(){
        fs.mkdir(path, callback);
      });
    }
  });
};

var checkParent = function(path, callback){
  var parent = pathFn.dirname(path);

  fs.exists(parent, function(exist){
    if (exist) return callback();

    mkdirs(parent, function(err){
      if (err && err.code === 'EEXIST') return callback();

      callback(err);
    });
  });
};

/**
* Writes a file.
*
* @method writeFile
* @param {String} path
* @param {String|Buffer} data
* @param {Object} [options]
*   @param {Boolean} [options.checkParent=true] Creates the parent directories if not exist.
* @param {Function} callback
* @async
* @static
*/

var writeFile = exports.writeFile = function(path, data, options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  options = _.extend({
    checkParent: true
  }, options);

  async.series([
    // Check parent folder existance
    function(next){
      if (!options.checkParent) return next();

      checkParent(path, next);
    }
  ], function(err){
    if (err) return callback(err);

    fs.writeFile(path, data, options, callback);
  });
};

/**
* Appends a file. Creates the file if not yet exists.
*
* @method appendFile
* @param {String} path
* @param {String|Buffer} data
* @param {Object} [options]
*   @param {Boolean} [options.checkParent=true] Creates the parent directories if not exist.
* @param {Function} callback
* @async
* @static
*/

var appendFile = exports.appendFile = function(path, data, options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  options = _.extend({
    checkParent: true
  }, options);

  async.series([
    // Check parent folder existance
    function(next){
      if (!options.checkParent) return next();

      checkParent(path, next);
    }
  ], function(err){
    if (err) return callback(err);

    fs.appendFile(path, data, options, callback);
  });
};

/**
* Copies a file from `src` to `dest`.
*
* @method copyFile
* @param {String} src
* @param {String} dest
* @param {Object} [options]
*   @param {Boolean} [options.checkParent=true] Creates the parent directories if not exist.
* @param {Function} callback
* @async
* @static
*/

var copyFile = exports.copyFile = function(src, dest, options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  options = _.extend({
    checkParent: true
  }, options);

  var called = false;

  async.series([
    // Check parent folder existance
    function(next){
      if (!options.checkParent) return next();

      checkParent(dest, next);
    }
  ], function(err){
    if (err) return callback(err);

    var rs = fs.createReadStream(src),
      ws = fs.createWriteStream(dest);

    rs.pipe(ws)
      .on('error', function(err){
        if (err && !called){
          called = true;
          callback(err);
        }
      });

    ws.on('close', callback)
      .on('error', function(err){
        if (err && !called){
          called = true;
          callback(err);
        }
      });
  });
};

/**
* Copies a directory from `src` to `dest`.
*
* @method copyDir
* @param {String} src
* @param {String} dest
* @param {Object} [options]
*   @param {Boolean} [options.ignoreHidden=true] Ignores hidden files.
*   @param {RegExp} [options.ignorePattern] The file name pattern to ignore.
* @param {Function} callback
* @async
* @static
*/

var copyDir = exports.copyDir = function(src, dest, options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  options = _.extend({
    ignoreHidden: true,
    ignorePattern: null
  }, options);

  async.series([
    // Create parent folder
    function(next){
      fs.exists(dest, function(exist){
        if (exist) return next();

        mkdirs(dest, next);
      });
    }
  ], function(err){
    if (err) return callback(err);

    fs.readdir(src, function(err, files){
      if (err) return callback(err);

      async.each(files, function(item, next){
        if (options.ignoreHidden && item[0] === '.') return next();
        if (options.ignorePattern && options.ignorePattern.test(item)) return next();

        var childSrc = join(src, item),
          childDest = join(dest, item);

        fs.stat(childSrc, function(err, stats){
          if (err) return callback(err);

          if (stats.isDirectory()){
            copyDir(childSrc, childDest, options, next);
          } else {
            copyFile(childSrc, childDest, {checkParent: false}, next);
          }
        });
      }, callback);
    });
  });
};

/**
* Returns a list of files in the directory.
*
* @method list
* @param {String} path
* @param {Object} [options]
*   @param {Boolean} [options.ignoreHidden=true] Ignores hidden files.
*   @param {RegExp} [options.ignorePattern] The file path pattern to ignore.
* @param {Function} callback
* @async
* @static
*/

var list = exports.list = function(path, options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  options = _.extend({
    ignoreHidden: true,
    ignorePattern: null
  }, options);

  var parent = options._parent;

  fs.readdir(path, function(err, files){
    if (err) return callback(err);

    var arr = [];

    async.each(files, function(item, next){
      if (options.ignoreHidden && item[0] === '.') return next();
      if (options.ignorePattern && options.ignorePattern.test(item)) return next();

      var childPath = join(path, item);

      fs.stat(childPath, function(err, stats){
        if (err) return callback(err);

        if (stats.isDirectory()){
          var childOptions = _.extend({}, options, {
            _parent: parent ? join(parent, item) : item
          });

          list(childPath, childOptions, function(err, files){
            if (err) return callback(err);

            arr = arr.concat(files);

            next();
          });
        } else {
          if (parent){
            arr.push(join(parent, item));
          } else {
            arr.push(item);
          }

          next();
        }
      });
    }, function(err){
      callback(err, arr);
    });
  });
};

var escape = function(str){
  // Transform EOL
  if (EOL !== '\n') str = str.replace(EOLre, '\n');

  // Remove UTF BOM
  str = str.replace(/^\uFEFF/, '');

  return str;
};

/**
* Reads a file.
*
* @method readFile
* @param {String} path
* @param {Object} [options]
*   @param {Boolean} [options.escape=true] Transforms EOL & Removes UTF BOM in the file.
*   @param {String} [options.encoding=utf8] File encoding.
* @param {Function} callback
* @async
* @static
*/

var readFile = exports.readFile = function(path, options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  options = _.extend({
    escape: true,
    encoding: 'utf8'
  }, options);

  fs.readFile(path, options.encoding, function(err, content){
    if (err) return callback(err);

    if (options.escape && options.encoding) content = escape(content);

    callback(null, content);
  });
};

/**
* Reads a file synchronizedly.
*
* @method readFileSync
* @param {String} path
* @param {Object} [options]
*   @param {Boolean} [options.escape=true] Transforms EOL & Removes UTF BOM in the file.
*   @param {String} [options.encoding=utf8] File encoding.
* @static
*/

var readFileSync = exports.readFileSync = function(path, options){
  if (!options) options = {};

  options = _.extend({
    escape: true,
    encoding: 'utf8'
  }, options);

  var content = fs.readFileSync(path, options.encoding);
  if (options.escape && options.encoding) content = escape(content);

  return content;
};

/**
* Cleans a directory.
*
* @method emptyDir
* @param {String} path
* @param {Object} [options]
*   @param {Boolean} [options.ignoreHidden=true] Ignores hidden files.
*   @param {RegExp} [options.ignorePattern] The file name pattern to ignore.
*   @param {Array} [options.exclude] The list of file path you don't want to delete.
* @param {Function} callback
* @async
* @static
*/

var emptyDir = exports.emptyDir = function(path, options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  options = _.extend({
    ignoreHidden: true,
    ignorePattern: null,
    exclude: []
  }, options);

  var parent = options._parent || '',
    arr = [];

  fs.readdir(path, function(err, files){
    if (err) return callback(err);

    async.each(files, function(item, next){
      var itemPath = join(parent, item),
        childPath = join(path, item);

      if (options.ignoreHidden && item[0] === '.') return next();
      if (options.ignorePattern && options.ignorePattern.test(itemPath)) return next();
      if (options.exclude && options.exclude.indexOf(itemPath) > -1) return next();

      fs.stat(childPath, function(err, stats){
        if (err) return callback(err);

        if (stats.isDirectory()){
          emptyDir(childPath, _.extend({}, options, {_parent: itemPath}), function(err, removed){
            if (err) return callback(err);

            arr = arr.concat(removed);

            fs.readdir(childPath, function(err, files){
              if (err) return callback(err);
              if (files.length) return next();

              fs.rmdir(childPath, next);
            });
          });
        } else {
          arr.push(itemPath);
          fs.unlink(childPath, next);
        }
      });
    }, function(err){
      callback(err, arr);
    });
  });
};

/**
* Removes a directory.
*
* @method rmdir
* @param {String} path
* @param {Function} callback
* @async
* @static
*/

var rmdir = exports.rmdir = function(path, callback){
  if (typeof callback !== 'function') callback = function(){};

  fs.readdir(path, function(err, files){
    if (err) return callback(err);

    async.each(files, function(item, next){
      var childPath = join(path, item);

      fs.stat(childPath, function(err, stats){
        if (err) return callback(err);

        if (stats.isDirectory()){
          rmdir(childPath, next);
        } else {
          fs.unlink(childPath, next);
        }
      });
    }, function(){
      fs.rmdir(path, callback);
    });
  });
};

var _parseWatchType = function(type){
  switch (type){
    case 'add':
      return 'create';

    case 'change':
      return 'update';

    case 'unlink':
      return 'delete';

    default:
      return type;
  }
};

/**
* Watch a directory or a file.
*
* @method watch
* @param {String} path
* @param {Object} [options] See [chokidar](https://github.com/paulmillr/chokidar)
* @param {Function} callback
* @static
*/

var watch = exports.watch = function(path, options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  options = _.extend({
    persistent: true,
    ignoreInitial: true
  }, options);

  if (options.ignorePattern) options.ignored = options.ignorePattern;

  var watcher = chokidar.watch(path, options);

  watcher.on('all', function(type, src, stats){
    callback(_parseWatchType(type), src, stats);
  });
};