'use strict';

try {
  module.exports = require('./xxhash');
} catch (err) {
  module.exports = require('./sha1');
}
