import { Pattern } from 'hexo-util';
import { extname } from 'path';
import type { _File } from '../../box';
import type Theme from '..';

function process(file: _File) {
  const { path } = file.params;
  const ext = extname(path);
  const name = path.substring(0, path.length - ext.length);
  const { i18n } = (file.box as Theme);

  if (file.type === 'delete') {
    i18n.remove(name);
    return;
  }

  return file.render().then(data => {
    if (typeof data !== 'object') return;
    i18n.set(name, data);
  });
}

const pattern = new Pattern('languages/*path');

export const i18n = {
  pattern,
  process
};
