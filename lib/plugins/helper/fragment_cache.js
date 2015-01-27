'use strict';

module.exports = function(ctx){
  var cache = {};

  return function fragmentCache(id, fn){
    if (this.cache && cache[id] != null) return cache[id];

    var result = cache[id] = fn();
    return result;
  };
};