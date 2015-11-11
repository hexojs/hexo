'use strict';

var Stream = require('stream');
var Transform = Stream.Transform;
var crypto = require('crypto');

var ALGORITHM = 'sha1';
var ENCODING = 'hex';

function Sha1Stream() {
  Transform.call(this);

  this._hash = crypto.createHash(ALGORITHM);
}

require('util').inherits(Sha1Stream, Transform);

Sha1Stream.prototype._transform = function(chunk, enc, callback) {
  var buffer = chunk instanceof Buffer ? chunk : new Buffer(chunk, enc);

  this._hash.update(buffer);
  callback();
};

Sha1Stream.prototype._flush = function(callback) {
  this.push(this._hash.digest(ENCODING));
  callback();
};

exports.hash = function(content) {
  var hash = crypto.createHash(ALGORITHM);
  hash.update(content);
  return hash.digest(ENCODING);
};

exports.stream = function() {
  return new Sha1Stream();
};
