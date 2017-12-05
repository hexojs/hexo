'use strict';

var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');
var Stream = require('stream');
var util = require('util');
var Readable = Stream.Readable;

function Router() {
  EventEmitter.call(this);

  this.routes = {};
}

util.inherits(Router, EventEmitter);

Router.format = Router.prototype.format = function(path) {
  path = path || '';
  if (typeof path !== 'string') throw new TypeError('path must be a string!');

  path = path
    .replace(/^\/+/, '') // Remove prefixed slashes
    .replace(/\\/g, '/') // Replaces all backslashes
    .replace(/\?.*$/, ''); // Remove query string

  // Appends `index.html` to the path with trailing slash
  if (!path || path[path.length - 1] === '/') {
    path += 'index.html';
  }

  return path;
};

Router.prototype.list = function() {
  var routes = this.routes;
  var keys = Object.keys(routes);
  var arr = [];
  var key;

  for (var i = 0, len = keys.length; i < len; i++) {
    key = keys[i];
    if (routes[key]) arr.push(key);
  }

  return arr;
};

Router.prototype.get = function(path) {
  if (typeof path !== 'string') throw new TypeError('path must be a string!');

  var data = this.routes[this.format(path)];
  if (data == null) return;

  return new RouteStream(data);
};

Router.prototype.isModified = function(path) {
  if (typeof path !== 'string') throw new TypeError('path must be a string!');

  var data = this.routes[this.format(path)];
  return data ? data.modified : false;
};

Router.prototype.set = function(path, data) {
  if (typeof path !== 'string') throw new TypeError('path must be a string!');
  if (data == null) throw new TypeError('data is required!');

  var obj;

  if (typeof data === 'object' && data.data != null) {
    obj = data;
  } else {
    obj = {
      data: data,
      modified: true
    };
  }

  if (typeof obj.data === 'function') {
    if (obj.data.length) {
      obj.data = Promise.promisify(obj.data);
    } else {
      obj.data = Promise.method(obj.data);
    }
  }

  path = this.format(path);

  this.routes[path] = {
    data: obj.data,
    modified: obj.modified == null ? true : obj.modified
  };

  this.emit('update', path);

  return this;
};

Router.prototype.remove = function(path) {
  if (typeof path !== 'string') throw new TypeError('path must be a string!');
  path = this.format(path);

  this.routes[path] = null;
  this.emit('remove', path);

  return this;
};

function RouteStream(data) {
  Readable.call(this, {objectMode: true});

  this._data = data.data;
  this._ended = false;
  this.modified = data.modified;
}

util.inherits(RouteStream, Readable);

RouteStream.prototype._read = function() {
  var data = this._data;

  if (typeof data !== 'function') {
    this.push(data);
    this.push(null);
    return;
  }

  // Don't read it twice!
  if (this._ended) return false;
  this._ended = true;

  var self = this;

  data().then(function(data) {
    if (data instanceof Stream && data.readable) {
      data.on('data', function(d) {
        self.push(d);
      });

      data.on('end', function() {
        self.push(null);
      });

      data.on('error', function(err) {
        self.emit('error', err);
      });
    } else if (data instanceof Buffer || typeof data === 'string') {
      self.push(data);
      self.push(null);
    } else if (typeof data === 'object') {
      self.push(JSON.stringify(data));
      self.push(null);
    } else {
      self.push(null);
    }
  }).catch(function(err) {
    self.emit('error', err);
    self.push(null);
  });
};

module.exports = Router;
