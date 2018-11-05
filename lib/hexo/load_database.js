'use strict';

const fs = require('hexo-fs');
const Promise = require('bluebird');

module.exports = ctx => {
  if (ctx._dbLoaded) return Promise.resolve();

  const db = ctx.database;
  const { path } = db.options;
  const { log } = ctx;

  return fs.exists(path).then(exist => {
    if (!exist) return;

    log.debug('Loading database.');
    return db.load();
  }).then(() => {
    ctx._dbLoaded = true;
  }).catch(() => {
    log.error('Database load failed. Deleting database.');
    return fs.unlink(path);
  });
};
