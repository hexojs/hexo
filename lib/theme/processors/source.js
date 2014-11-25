var Pattern = require('../../box/pattern');

var rHiddenFile = /^_|\/_/;

exports.process = function(data){
  //
};

exports.pattern = new Pattern(function(path){
  if (path.substring(0, 6) !== 'source') return;

  path = path.substring(7);
  if (rHiddenFile.test(path)) return;

  return {path: path};
});