'use strict';

const { Pattern } = require('hexo-util');

exports.process = file => {
  const { path } = file.params;

  if (file.type === 'delete') {
    file.box.removeView(path);
    return;
  }

  return file.read().then(result => {
    file.box.setView(path, result);
  });
};

exports.pattern = new Pattern('layout/*path');
