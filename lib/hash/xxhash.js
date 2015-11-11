'use strict';

var xxhash = require('xxhash');

var SEED = 0xCAFEBABE;
var ENCODING = 'hex';

exports.hash = function(content) {
  return xxhash.hash64(new Buffer(content), SEED, ENCODING);
};

exports.stream = function() {
  return new xxhash.Stream(SEED, 64, ENCODING);
};
