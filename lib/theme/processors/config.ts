import {Pattern} from 'hexo-util';

export function process(file) {
  if (file.type === 'delete') {
    file.box.config = {};
    return;
  }

  return file.render().then(result => {
    file.box.config = result;
    this.log.debug('Theme config loaded.');
  }).catch(err => {
    this.log.error('Theme config load failed.');
    throw err;
  });
}

export const pattern = new Pattern(/^_config\.\w+$/);
