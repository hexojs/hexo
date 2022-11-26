'use strict';

const { Pattern } = require('hexo-util');
const { extname } = require('path');

exports.process = file => {
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
};

exports.pattern = new Pattern('languages/*path');
