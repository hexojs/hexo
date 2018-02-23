'use strict';

const Pattern = require('hexo-util').Pattern;
const pathFn = require('path');

exports.process = file => {
  const path = file.params.path;
  const extname = pathFn.extname(path);
  const name = path.substring(0, path.length - extname.length);
  const i18n = file.box.i18n;

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
