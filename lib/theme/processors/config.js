'use strict';

const Pattern = require('hexo-util').Pattern;

exports.process = function(file) {
  if (file.type === 'delete') {
    file.box.config = {};
    return;
  }

  const self = this;

  return file.render().then(result => {
    file.box.config = result;
    self.log.debug('Theme config loaded.');
  }).catch(err => {
    self.log.error('Theme config load failed.');
    throw err;
  });
};

exports.pattern = new Pattern(/^_config\.\w+$/);
