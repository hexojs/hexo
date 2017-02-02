'use strict';

var _ = require('lodash');
var Pattern = require('hexo-util').Pattern;
var common = require('../../plugins/processor/common');

exports.process = function(file) {
  var Asset = this.model('Asset');
  var id = file.source.substring(this.base_dir.length).replace(/\\/g, '/');
  var path = file.params.path;
  var doc = Asset.findById(id);

  if (file.type === 'delete') {
    if (doc) {
      return doc.remove();
    }

    return;
  }

  return Asset.save({
    _id: id,
    path: path,
    modified: file.type !== 'skip'
  });
};

exports.pattern = new Pattern(function(path) {
  if (!_.startsWith(path, 'source/')) return false;

  path = path.substring(7);
  if (common.isHiddenFile(path) || common.isTmpFile(path) || ~path.indexOf('node_modules')) return false;

  return {path: path};
});
