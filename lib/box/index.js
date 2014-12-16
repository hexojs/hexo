var pathFn = require('path');
var Promise = require('bluebird');
var _ = require('lodash');
var File = require('./file');
var Pattern = require('./pattern');
var util = require('../util');
var fs = require('hexo-fs');
var prettyHrtime = require('pretty-hrtime');
var crypto = require('crypto');
var tildify = require('tildify');

var escape = util.escape;
var join = pathFn.join;
var sep = pathFn.sep;
var rSep = new RegExp(escape.regex(sep), 'g');

require('colors');

function Box(ctx, base, options){
  this.options = _.extend({
    presistent: true,
    ignored: /[\/\\]\./,
    ignoreInitial: true
  }, options);

  if (base.substring(base.length - 1) !== sep){
    base += sep;
  }

  this.context = ctx;
  this.base = base;
  this.processors = [];
  this.processingFiles = {};
  this.watcher = null;
  this.Cache = ctx.model('Cache');
  this.bufferStore = {};

  var _File = this.File = function(data){
    File.call(this, data);
  };

  util.inherits(_File, File);

  _File.prototype.box = this;

  _File.prototype.render = function(options, callback){
    if (!callback && typeof options === 'function'){
      callback = options;
      options = {};
    }

    var self = this;

    return this.read().then(function(content){
      return ctx.render.render({
        text: content,
        path: self.source
      }, options);
    }).nodeify(callback);
  };

  _File.prototype.renderSync = function(options){
    return ctx.render.renderSync({
      text: this.readSync(),
      path: this.source
    }, options);
  };
}

function patternNoob(){
  return {};
}

var escapeBackslash;

if (sep === '/'){
  escapeBackslash = function(path){
    return path;
  };
} else {
  escapeBackslash = function(path){
    // Replace backslashes on Windows
    return path.replace(rSep, '/');
  };
}

Box.prototype.addProcessor = function(pattern, fn){
  if (!fn && typeof pattern === 'function'){
    fn = pattern;
    pattern = new Pattern(patternNoob);
  }

  if (typeof fn !== 'function') throw new TypeError('fn must be a function');
  if (!(pattern instanceof Pattern)) pattern = new Pattern(pattern);

  this.processors.push({
    pattern: pattern,
    process: Promise.method(fn)
  });
};

Box.prototype.process = function(callback){
  var self = this;

  return this._loadFiles().then(function(files){
    return self._process(files);
  }).nodeify(callback);
};

function listDir(path){
  return fs.listDir(path).catch(function(err){
    // Return an empty array if path does not exist
    if (err.cause.code !== 'ENOENT') throw err;
    return [];
  }).map(escapeBackslash);
}

Box.prototype._loadFiles = function(){
  var base = this.base;
  var Cache = this.Cache;
  var self = this;
  var ctx = this.context;
  var relativeBase = escapeBackslash(base.substring(ctx.base_dir.length));
  var regex = new RegExp('^' + escape.regex(relativeBase));
  var baseLength = relativeBase.length;

  // Find existing cache data
  var existed = Cache.find({_id: regex}).map(function(item){
    return item._id.substring(baseLength);
  });

  return listDir(base).then(function(files){
    var result = [];

    // created = files - existed
    var created = _.difference(files, existed);
    var i, len, item;

    for (i = 0, len = created.length; i < len; i++){
      item = created[i];

      result.push({
        path: item,
        type: 'create'
      });
    }

    for (i = 0, len = existed.length; i < len; i++){
      item = existed[i];

      if (~files.indexOf(item)){
        result.push({
          path: item,
          type: 'update'
        });
      } else {
        result.push({
          path: item,
          type: 'delete'
        });
      }
    }

    return result;
  }).map(function(item){
    switch (item.type){
      case 'create':
      case 'update':
        return self._handleUpdatedFile(item.path);

      case 'delete':
        return self._handleDeletedFile(item.path);
    }
  });
};

function getChecksum(path){
  return new Promise(function(resolve, reject){
    var hash = crypto.createHash('sha1');
    var buffers = [];
    var length = 0;
    var stream = fs.createReadStream(path);

    stream.on('readable', function(){
      var chunk;

      while ((chunk = stream.read()) != null){
        length += chunk.length;
        buffers.push(chunk);
        hash.update(chunk);
      }
    }).on('end', function(){
      resolve({
        content: Buffer.concat(buffers, length),
        checksum: hash.digest('hex')
      });
    }).on('error', reject);
  });
}

Box.prototype._handleUpdatedFile = function(path){
  var Cache = this.Cache;
  var ctx = this.context;
  var fullPath = join(this.base, path);
  var self = this;

  return getChecksum(fullPath).then(function(data){
    var id = escapeBackslash(fullPath.substring(ctx.base_dir.length));
    var cache = Cache.findById(id);
    var checksum = data.checksum;

    self.bufferStore[path] = data.content;

    if (!cache){
      return Cache.insert({
        _id: id,
        checksum: checksum
      }).thenReturn({
        type: 'create',
        path: path
      });
    } else if (cache.checksum === checksum){
      return {
        type: 'skip',
        path: path
      };
    } else {
      cache.checksum = checksum;
      return cache.save().thenReturn({
        type: 'update',
        path: path
      });
    }
  });
};

Box.prototype._handleDeletedFile = function(path){
  var fullPath = join(this.base, path);
  var ctx = this.context;
  var Cache = this.Cache;

  this.bufferStore[path] = null;

  return new Promise(function(resolve, reject){
    var id = escapeBackslash(fullPath.substring(ctx.base_dir.length));
    var cache = Cache.findById(id);
    if (!cache) return resolve();

    return cache.remove().then(resolve, reject);
  }).thenReturn({
    type: 'delete',
    path: path
  });
};

Box.prototype._process = function(files){
  var self = this;

  return Promise.map(files, function(item){
    return self._dispatch(item);
  });
};

Box.prototype.load = Box.prototype.process;

Box.prototype._dispatch = function(item){
  var path = item.path;
  var File = this.File;
  var self = this;
  var ctx = this.context;
  var base = this.base;
  var start = process.hrtime();

  // Skip processing files
  if (this.processingFiles[path]) return;

  // Lock the file
  this.processingFiles[path] = true;

  // Use Promise.reduce to calculate the number of processors executed
  return Promise.reduce(this.processors, function(count, processor){
    // Check whether the path match with the pattern of the processor
    var params = processor.pattern.match(path);
    if (!params) return count;

    var file = new File({
      source: join(base, path),
      path: path,
      type: item.type,
      params: params,
      content: self.bufferStore[path]
    });

    return processor.process.call(ctx, file).thenReturn(count + 1);
  }, 0).then(function(count){
    // Display debug message if there're any processors executed
    if (count){
      var interval = prettyHrtime(process.hrtime(start));
      ctx.log.debug('Processed in %s: %s', interval.cyan, path.magenta);
    }
  }, function(err){
    ctx.log.error({err: err}, 'Process failed: %s', path.magenta);
    throw err;
  }).finally(function(){
    // Remember to unlock the file
    self.processingFiles[path] = false;
  });
};

Box.prototype.watch = function(callback){
  var base = this.base;
  var baseLength = base.length;
  var self = this;
  var log = this.context.log;

  function getPath(path){
    return escapeBackslash(path.substring(baseLength));
  }

  function dispatch(data){
    self._dispatch(data);
  }

  return new Promise(function(resolve, reject){
    if (self.watcher) return reject(new Error('Watcher has already started.'));
    fs.watch(base, self.options).then(resolve, reject);
  }).then(function(watcher){
    self.watcher = watcher;

    watcher.on('add', function(path){
      log.info('Added: %s', tildify(path).magenta);
      self._handleUpdatedFile(getPath(path)).then(dispatch);
    }).on('change', function(path){
      log.info('Updated: %s', tildify(path).magenta);
      self._handleUpdatedFile(getPath(path)).then(dispatch);
    }).on('unlink', function(path){
      log.info('Deleted: %s', tildify(path).magenta);
      self._handleDeletedFile(getPath(path)).then(dispatch);
    });

    return watcher;
  }).nodeify(callback);
};

Box.prototype.unwatch = function(){
  if (!this.watcher) throw new Error('Watcher hasn\'t started yet.');

  this.watcher.close();
  this.watcher = null;
};

Box.File = File;
Box.Pattern = Box.prototype.Pattern = Pattern;

module.exports = Box;