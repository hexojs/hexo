import { Pattern } from 'hexo-util';
import * as common from '../../plugins/processor/common';
import type { _File } from '../../box';

function process(file: _File) {
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
}

const pattern = new Pattern(path => {
  if (!path.startsWith('source/')) return false;

  path = path.substring(7);
  if (common.isHiddenFile(path) || common.isTmpFile(path) || path.includes('node_modules')) return false;

  return {path};
});

export const source = {
  pattern,
  process
};
