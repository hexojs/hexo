import { Pattern } from 'hexo-util';

function process(file) {
  const { path } = file.params;

  if (file.type === 'delete') {
    file.box.removeView(path);
    return;
  }

  return file.read().then(result => {
    file.box.setView(path, result);
  });
}

const pattern = new Pattern('layout/*path');

export const view = {
  pattern,
  process
};
