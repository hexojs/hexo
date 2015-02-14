'use strict';

var Stream = require('stream');
var Transform = Stream.Transform;
var crypto = require('crypto');

function ShasumStream(options){
  Transform.call(this, options);

  this._hash = crypto.createHash('sha1');
  this._shasum = '';
}

require('util').inherits(ShasumStream, Transform);

ShasumStream.prototype._transform = function(chunk, enc, callback){
  var buffer = chunk instanceof Buffer ? chunk : new Buffer(chunk, enc);

  this._hash.update(buffer);
  callback();
};

ShasumStream.prototype._flush = function(callback){
  this._shasum = this._hash.digest('hex');
  callback();
};

ShasumStream.prototype.getShasum = function(){
  return this._shasum;
};

module.exports = ShasumStream;