/**
 * Module dependencies.
 */

var fs = require('graceful-fs'),
  pathFn = require('path'),
  async = require('async'),
  _ = require('lodash'),
  EOL = require('os').EOL,
  EOLre = new RegExp(EOL, 'g');

/**
 * Fallback for Node.js 0.8 or below.
 */

if (!fs.exists || !fs.existsSync){
  fs.exists = pathFn.exists;
  fs.existsSync = pathFn.existsSync;
}

/**
 * Join the given `parent` and `child` into a normal file path.
 *
 * @param {String} parent
 * @param {String} child
 * @return {String}
 * @api private
 */

var join = function(parent, child){
  return parent ? pathFn.join(parent, child) : child;
};

/**
 * Create the directory in the given `path`, including any necessary but
 * nonexistent parent directories.
 *
 * @param {String} path
 * @param {Function} callback
 * @api public
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

/**
 * Check if the parent directories exists. If not, call `mkdirs`.
 *
 * @param {String} path
 * @param {Function} callback
 * @api private
 */

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
 * Write the `data` to the given `path`.
 *
 * Options:
 *
 *   - `checkParent`: Check the existance of parent directories before writing.
 *
 * @param {String} path
 * @param {String|Buffer} data
 * @param {Object} options
 * @param {Function} callback
 * @api public
 */

var writeFile = exports.writeFile = function(path, data, options, callback){
  if (_.isFunction(options)){
    callback = options;
    options = {};
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
 * Copy the file from `src` to `dest`.
 *
 * Options:
 *
 *   - `checkParent`: Check the existance of parent directories before writing.
 *
 * @param {String} src
 * @param {String} dest
 * @param {Object} options
 * @param {Function} callback
 * @api public
 */

var copyFile = exports.copyFile = function(src, dest, options, callback){
  if (_.isFunction(options)){
    callback = options;
    options = {};
  }

  options = _.extend({
    checkParent: true
  }, options);

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
        if (err) callback(err);
      });

    ws.on('close', callback)
      .on('error', function(err){
        if (err) callback(err);
      });
  });
};

/**
 * Copy the directory from `src` to `dest`.
 *
 * Options:
 *
 *   - `ignoreHidden`: Ignore hidden files.
 *   - `ignorePattern`: Ignore any files that match the pattern.
 *
 * @param {String} src
 * @param {String} dest
 * @param {Object} options
 * @param {Function} callback
 * @api public
 */

var copyDir = exports.copyDir = function(src, dest, options, callback){
  if (_.isFunction(options)){
    callback = options;
    options = {};
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

      async.forEach(files, function(item, next){
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
 * List all files in the given `path`.
 *
 * Options:
 *
 *   - `ignoreHidden`: Ignore hidden files.
 *   - `ignorePattern`: Ignore any files that match the pattern.
 *
 * @param {String} path
 * @param {Object} options
 * @param {Function} callback
 * @api public
 */

var list = exports.list = function(path, options, callback){
  if (_.isFunction(options)){
    callback = options;
    options = {};
  }

  options = _.extend({
    ignoreHidden: true,
    ignorePattern: null
  }, options);

  var parent = options._parent;

  fs.readdir(path, function(err, files){
    if (err) return callback(err);

    var arr = [];

    async.forEach(files, function(item, next){
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

/**
 * Transform EOL and remove UTF BOM in the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

var escape = function(str){
  // Transform EOL
  var str = EOL === '\n' ? str : str.replace(EOLre, '\n');

  // Remove UTF BOM
  str = str.replace(/^\uFEFF/, '');

  return str;
};

/**
 * Read the file from the given `path`.
 *
 * Options:
 *
 *   - `escape`: Transform EOL and remove UTF BOM.
 *   - `encoding`: File encoding.
 *
 * @param {String} path
 * @param {Object} options
 * @param {Function} callback
 * @api public
 */

var readFile = exports.readFile = function(path, options, callback){
  if (_.isFunction(options)){
    callback = options;
    options = {};
  }

  options = _.extend({
    escape: true,
    encoding: 'utf8'
  }, options);

  fs.readFile(path, options.encoding, function(err, content){
    if (err) return callback(err);

    if (options.escape) content = escape(content);

    callback(null, content);
  });
};

/**
 * Read the file from the given `path` synchronously.
 *
 * Options:
 *
 *   - `escape`: Transform EOL and remove UTF BOM.
 *   - `encoding`: File encoding.
 *
 * @param {String} path
 * @param {Object} options
 * @return {String}
 * @api public
 */

var readFileSync = exports.readFileSync = function(path, options){
  if (!options) options = {};

  options = _.extend({
    escape: true,
    encoding: 'utf8'
  }, options);

  var content = fs.readFileSync(path, options.encoding);
  if (options.escape) content = escape(content);

  return content;
};

/**
 * Empty a directory.
 *
 * Options:
 *
 *   - `ignoreHidden`: Ignore hidden files.
 *   - `ignorePattern`: Ignore any files that match the pattern.
 *   - `exclude`: File path to exclude
 *
 * @param {String} path
 * @param {Object} options
 * @param {Function} callback
 * @api public
 */

var emptyDir = exports.emptyDir = function(path, options, callback){
  if (_.isFunction(options)){
    callback = options;
    options = {};
  }

  options = _.extend({
    ignoreHidden: true,
    ignorePattern: null,
    exclude: []
  }, options);

  var exclude = [],
    childExclude = {};

  if (!Array.isArray(options.exclude)) options.exclude = [];

  options.exclude.forEach(function(item){
    var split = item.split('/'),
      front = split.shift();

    exclude.push(front);

    if (!childExclude[front]) childExclude[front] = [];
    if (split.length) childExclude[front].push(join.apply(null, split));
  });

  fs.readdir(path, function(err, files){
    if (err) return callback(err);

    async.forEach(files, function(item, next){
      if (options.ignoreHidden && item[0] === '.') return next();
      if (exclude.indexOf(item) > -1) return next();

      var childPath = join(path, item);

      fs.stat(childPath, function(err, stats){
        if (err) return callback(err);

        if (stats.isDirectory()){
          var childOptions = _.clone(options);
          options.exclude = childExclude[item];

          emptyDir(childPath, options, function(){
            fs.readdir(childPath, function(err, files){
              if (err) return callback(err);
              if (files.length) return next();

              fs.rmdir(childPath, next);
            });
          });
        } else {
          fs.unlink(childPath, next);
        }
      });
    }, callback);
  });
};

/**
 * Remove a directory.
 *
 * @param {String} path
 * @param {Function} callback
 * @api public
 */

var rmdir = exports.rmdir = function(path, callback){
  if (!_.isFunction(callback)) callback = function(){};

  fs.readdir(path, function(err, files){
    if (err) return callback(err);

    async.forEach(files, function(item, next){
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
    })
  });
};

/**
 * Watch for the given `path`.
 *
 * Options:
 *
 *   - `ignoreHidden`: Ignore hidden files.
 *   - `ignorePattern`: Ignore any files that match the pattern.
 *   - `interval`: Poll interval.
 *   - `presistent`: Whether the process should ontinue to run as long as files
 *                   are being watched.
 *   - `listener`: Listener
 *   - `next`: Called after the watchers are set.
 *   - `errror`: Called when an error occurred.
 *
 * @param {String} path
 * @param {Object} options
 * @return {watcher}
 * @api public
 */

var watch = exports.watch = function(path, options){
  options = _.extend({
    ignoreHidden: true,
    ignorePattern: null,
    interval: 5007,
    presistent: true,
    listener: function(){},
    next: function(){},
    error: function(){}
  }, options);

  var watcher = {
    emit: function(){},
    close: function(){}
  };

  var parent = options._parent || '';

  fs.stat(path, function(err, stats){
    if (err) return options.next(err);

    if (stats.isDirectory()){
      fs.readdir(path, function(err, list){
        if (err) return options.next(err);

        var watchers = {};

        watchers['/'] = fs.watch(path, options, function(type, item){
          if (options.ignoreHidden && item[0] === '.') return;
          if (options.ignorePattern && options.ignorePattern.test(item)) return;

          var childPath = join(path, item);

          fs.exists(childPath, function(exist){
            if (exist){
              fs.stat(childPath, function(err, stats){
                if (err) return options.error(err);

                if (stats.isDirectory()){
                  if (!watchers.hasOwnProperty(item)){
                    watchers[item] = watch(childPath, _.extend({
                      _parent: join(parent, item),
                      next: function(){}
                    }, options));
                  }
                } else {
                  if (list.indexOf(item) > -1){
                    options.listener('update', join(parent, item));
                  } else {
                    list.push(item);
                    options.listener('create', join(parent, item));
                  }
                }
              });
            } else {
              if (watchers.hasOwnProperty(item)){
                watchers[item].emit();
                watchers[item].close();
                delete watchers[item];
              } else {
                if (list.indexOf(item) > -1){
                  options.listener('delete', join(parent, item));
                }
              }

              list = _.without(list, item);
            }
          });
        });

        async.forEach(list, function(item, next){
          if (options.ignoreHidden && item[0] === '.') return next();
          if (options.ignorePattern && options.ignorePattern.test(item)) return next();

          var childPath = join(path, item);

          fs.stat(childPath, function(err, stats){
            if (err) return options.next(err);

            if (stats.isDirectory()){
              watchers[item] = watch(childPath, _.extend({
                _parent: join(parent, item),
                next: next
              }, options));
            } else {
              if (options._init){
                options.listener('create', join(parent, item));
              }
            }
          });
        }, options.next);


        watcher.emit = function(){
          list.forEach(function(item){
            if (watchers.hasOwnProperty(item)){
              item.emit();
            } else {
              options.listener('delete', join(parent, item));
            }
          });
        };

        watcher.close = function(){
          _.each(watchers, function(watcher){
            watcher.close();
          });
        };
      });
    } else {
      watcher = fs.watch(path, options, function(type){
        fs.exists(path, function(exist){
          if (exist){
            options.listener('update');
          } else {
            options.listener('delete');
            watcher.close();
          }
        });
      });

      options.next();
    }
  });

  return watcher;
};