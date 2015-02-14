'use strict';

var Pattern = require('hexo-util').Pattern;
var common = require('../../plugins/processor/common');

exports.process = function(file){
  var Asset = this.model('Asset');
  var id = file.source.substring(this.base_dir.length).replace(/\\/g, '/');
  var path = file.params.path;
  var doc = Asset.findById(id);

  if (file.type === 'delete'){
    if (doc){
      return doc.remove();
    } else {
      return;
    }
  }

  if (doc){
    doc.path = path;
    doc.modified = file.type !== 'skip';

    return doc.save();
  } else {
    return Asset.insert({
      _id: id,
      path: path
    });
  }
};

exports.pattern = new Pattern(function(path){
  if (path.substring(0, 7) !== 'source/') return false;

  path = path.substring(7);
  if (common.isHiddenFile(path) || common.isTmpFile(path)) return false;

  return {path: path};
});