import { Pattern } from 'hexo-util';
import type { _File } from '../../box';
import type Theme from '..';

function process(file: _File) {
  const { path } = file.params;

  if (file.type === 'delete') {
    (file.box as Theme).removeView(path);
    return;
  }

  return file.read().then(result => {
    (file.box as Theme).setView(path, result);
  });
}

const pattern = new Pattern('layout/*path');

export const view = {
  pattern,
  process
};
