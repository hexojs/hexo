var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');
var Readable = require('stream').Readable;
var util = require('util');

function Router(){
  EventEmitter.call(this);

  this.routes = {};
}

util.inherits(Router, EventEmitter);

Router.format = Router.prototype.format = function(path){
  path = path || '';
  if (typeof path !== 'string') throw new TypeError('path must be a string!');

  path = path
    .replace(/^\/+/, '') // Remove prefixed slashes
    .replace(/\\/g, '/') // Replaces all backslashes
    .replace(/\?.*$/, ''); // Remove query string

  // Appends `index.html` to the path with trailing slash
  if (!path || path[path.length - 1] === '/'){
    path += 'index.html';
  }

  return path;
};

Router.prototype.list = function(){
  var routes = this.routes;
  var keys = Object.keys(routes);
  var arr = [];
  var key;

  for (var i = 0, len = keys.length; i < len; i++){
    key = keys[i];
    if (routes[key]) arr.push(key);
  }

  return arr;
};

Router.prototype.get = function(path){
  if (typeof path !== 'string') throw new TypeError('path must be a string!');

  var data = this.routes[this.format(path)];
  if (!data) return;

  return new RouteStream(data);
};

Router.prototype.isModified = function(path){
  if (typeof path !== 'string') throw new TypeError('path must be a string!');

  var data = this.routes[this.format(path)];
  return data ? data.modified : false;
};

Router.prototype.set = function(path, data_){
  if (typeof path !== 'string') throw new TypeError('path must be a string!');
  if (data_ == null) throw new TypeError('data is required!');

  var data;
  path = this.format(path);

  if (typeof data_ === 'function'){
    if (data_.length){
      data = Promise.promisify(data_);
    } else {
      data = Promise.method(data_);
    }
  } else {
    data = function(){
      return Promise.resolve(data_);
    };
  }

  // TODO: Maybe the stream can be reused?
  // this.routes[path] = new RouteStream(data, data_.modified);
  data.modified = data_.modified == null ? true : data_.modified;
  this.routes[path] = data;
  this.emit('update', path);

  return this;
};

Router.prototype.remove = function(path){
  if (typeof path !== 'string') throw new TypeError('path must be a string!');
  path = this.format(path);

  this.routes[path] = null;
  this.emit('remove', path);

  return this;
};

function RouteStream(data){
  Readable.call(this);

  this._data = data;
  this._ended = false;
  this.modified = data.modified;
}

util.inherits(RouteStream, Readable);

RouteStream.prototype._read = function(){
  // Don't read it twice!
  if (this._ended) return false;
  this._ended = true;

  var self = this;

  this._data().then(function(data){
    if (data instanceof Readable){
      data.on('readable', function(){
        var chunk;

        // Start reading files...
        while ((chunk = data.read()) !== null){
          // Push data
          self.push(chunk);
        }
      }).on('error', function(err){
        self.emit('error', err);
      }).on('end', function(){
        // Don't forget to close the stream or the stream will keep reading
        self.push(null);
      });
    } else if (data instanceof Buffer || typeof data === 'string'){
      self.push(data);
      self.push(null);
    } else {
      self.push(null);
    }
  }, function(err){
    self.emit('error', err);
  });
};

module.exports = Router;