'use strict';

const { Pattern } = require('hexo-util');
const pathFn = require('path');

exports.process = file => {
  const { path } = file.params;
  const extname = pathFn.extname(path);
  const name = path.substring(0, path.length - extname.length);
  const { i18n } = file.box;

  if (file.type === 'delete') {
    i18n.remove(name);
    return;
  }

  return file.render().then(data => {
    if (typeof data !== 'object') return;
    i18n.set(name, data);
  });
};

exports.pattern = new Pattern('languages/*path');
