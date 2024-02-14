import { Pattern } from 'hexo-util';
import type { _File } from '../../box';
import Theme from '..';

function process(file: _File) {
  if (file.type === 'delete') {
    (file.box as Theme).config = {};
    return;
  }

  return file.render().then(result => {
    (file.box as Theme).config = result;
    this.log.debug('Theme config loaded.');
  }).catch(err => {
    this.log.error('Theme config load failed.');
    throw err;
  });
}

const pattern = new Pattern(/^_config\.\w+$/);

export const config = {
  pattern,
  process
};
