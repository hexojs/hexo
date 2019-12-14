'use strict';

const { readFile, readFileSync, stat, statSync } = require('hexo-fs');

function File(data) {
  this.source = data.source;
  this.path = data.path;
  this.params = data.params;
  this.type = data.type;
}

File.prototype.read = function(options, callback) {
  return readFile(this.source, options).asCallback(callback);
};

File.prototype.readSync = function(options) {
  return readFileSync(this.source, options);
};

File.prototype.stat = function(options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  return stat(this.source).asCallback(callback);
};

File.prototype.statSync = function(options) {
  return statSync(this.source);
};

File.TYPE_CREATE = 'create';
File.TYPE_UPDATE = 'update';
File.TYPE_SKIP = 'skip';
File.TYPE_DELETE = 'delete';

module.exports = File;
