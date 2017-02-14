'use strict';

var Schema = require('warehouse').Schema;
var Promise = require('bluebird');

module.exports = function(ctx) {
  var Cache = new Schema({
    _id: {type: String, required: true},
    hash: {type: String, default: ''},
    modified: {type: Number, default: Date.now}
  });

  Cache.static('compareFile', function(id, hashFn, statFn) {
    var cache = this.findById(id);
    var self = this;
    var mtime;

    // If cache does not exist, then it must be a new file. We have to get both
    // file hash and stats.
    if (!cache) {
      return Promise.all([hashFn(id), statFn(id)]).spread(function(hash, stats) {
        return self.insert({
          _id: id,
          hash: hash,
          modified: stats.mtime
        });
      }).thenReturn({
        type: 'create'
      });
    }

    // Get file stats
    return statFn(id).then(function(stats) {
      mtime = stats.mtime;

      // Skip the file if the modified time is unchanged
      if (cache.modified === mtime) {
        return {
          type: 'skip'
        };
      }

      // Get file hash
      return hashFn(id);
    }).then(function(result) {
      // If the result is an object, skip the following steps because it's an
      // unchanged file
      if (typeof result === 'object') return result;

      var hash = result;

      // Skip the file if the hash is unchanged
      if (cache.hash === hash) {
        return {
          type: 'skip'
        };
      }

      // Update cache info
      cache.hash = hash;
      cache.modified = mtime;

      return cache.save().thenReturn({
        type: 'update'
      });
    });
  });

  return Cache;
};
