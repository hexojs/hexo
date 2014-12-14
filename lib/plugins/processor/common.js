var Pattern = require('../../box/pattern');

function isTmpFile(path){
  var last = path[path.length - 1];
  return last === '%' || last === '~';
}

function isHiddenFile(path){
  if (path[0] === '_') return true;
  return /\/_/.test(path);
}

exports.ignoreTmpAndHiddenFile = new Pattern(function(path){
  if (isTmpFile(path) || isHiddenFile(path)) return false;
  return true;
});

exports.isTmpFile = isTmpFile;
exports.isHiddenFile = isHiddenFile;