'use strict';

const Pattern = require('hexo-util').Pattern;

exports.process = file => {
  const path = file.params.path;

  if (file.type === 'delete') {
    file.box.removeView(path);
    return;
  }

  return file.read().then(result => {
    file.box.setView(path, result);
  });
};

exports.pattern = new Pattern('layout/*path');
