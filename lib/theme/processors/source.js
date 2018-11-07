'use strict';

const { Pattern } = require('hexo-util');
const common = require('../../plugins/processor/common');

exports.process = function(file) {
  const Asset = this.model('Asset');
  const id = file.source.substring(this.base_dir.length).replace(/\\/g, '/');
  const { path } = file.params;
  const doc = Asset.findById(id);

  if (file.type === 'delete') {
    if (doc) {
      return doc.remove();
    }

    return;
  }

  return Asset.save({
    _id: id,
    path,
    modified: file.type !== 'skip'
  });
};

exports.pattern = new Pattern(path => {
  if (!path.startsWith('source/')) return false;

  path = path.substring(7);
  if (common.isHiddenFile(path) || common.isTmpFile(path) || path.includes('node_modules')) return false;

  return {path};
});
