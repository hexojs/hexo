'use strict';

const { EventEmitter } = require('events');
const Promise = require('bluebird');
const Stream = require('stream');
const { inherits } = require('util');
const { Readable } = Stream;

function Router() {
  Reflect.apply(EventEmitter, this, []);

  this.routes = {};
}

inherits(Router, EventEmitter);

const format = path => {
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

Router.format = format;
Router.prototype.format = Router.format;

Router.prototype.list = function() {
  const { routes } = this;
  return Object.keys(routes).filter(key => routes[key]);
};

Router.prototype.get = function(path) {
  if (typeof path !== 'string') throw new TypeError('path must be a string!');

  const data = this.routes[this.format(path)];
  if (data == null) return;

  return new RouteStream(data);
};

Router.prototype.isModified = function(path) {
  if (typeof path !== 'string') throw new TypeError('path must be a string!');

  const data = this.routes[this.format(path)];
  return data ? data.modified : false;
};

Router.prototype.set = function(path, data) {
  if (typeof path !== 'string') throw new TypeError('path must be a string!');
  if (data == null) throw new TypeError('data is required!');

  let obj;

  if (typeof data === 'object' && data.data != null) {
    obj = data;
  } else {
    obj = {
      data,
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
  Reflect.apply(Readable, this, [{objectMode: true}]);

  this._data = data.data;
  this._ended = false;
  this.modified = data.modified;
}

inherits(RouteStream, Readable);

RouteStream.prototype._read = function() {
  const data = this._data;

  if (typeof data !== 'function') {
    this.push(data);
    this.push(null);
    return;
  }

  // Don't read it twice!
  if (this._ended) return false;
  this._ended = true;

  data().then(data => {
    if (data instanceof Stream && data.readable) {
      data.on('data', d => {
        this.push(d);
      });

      data.on('end', () => {
        this.push(null);
      });

      data.on('error', err => {
        this.emit('error', err);
      });
    } else if (data instanceof Buffer || typeof data === 'string') {
      this.push(data);
      this.push(null);
    } else if (typeof data === 'object') {
      this.push(JSON.stringify(data));
      this.push(null);
    } else {
      this.push(null);
    }
  }).catch(err => {
    this.emit('error', err);
    this.push(null);
  });
};

module.exports = Router;
