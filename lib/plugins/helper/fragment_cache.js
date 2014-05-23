var cache = {};

module.exports = function(id, fn){
  if (this.cache && cache[id] != null) return cache[id];

  var result = cache[id] = fn();
  return result;
};