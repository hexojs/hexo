import { Pattern } from 'hexo-util';
import { extname } from 'path';

function process(file) {
  const { path } = file.params;
  const ext = extname(path);
  const name = path.substring(0, path.length - ext.length);
  const { i18n } = file.box;

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
