import {Pattern} from 'hexo-util';

export function process(file) {
  const { path } = file.params;

  if (file.type === 'delete') {
    file.box.removeView(path);
    return;
  }

  return file.read().then(result => {
    file.box.setView(path, result);
  });
}

export var pattern = new Pattern('layout/*path');
