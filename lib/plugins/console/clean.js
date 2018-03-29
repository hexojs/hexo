'use strict';

const Promise = require('bluebird');
const fs = require('hexo-fs');

function cleanConsole(args) {
  return Promise.all([
    deleteDatabase(this),
    deletePublicDir(this),
    this.execFilter('after_clean', null, {context: this})
  ]);
}

function deleteDatabase(ctx) {
  const dbPath = ctx.database.options.path;

  return fs.exists(dbPath).then(exist => {
    if (!exist) return;

    return fs.unlink(dbPath).then(() => {
      ctx.log.info('Deleted database.');
    });
  });
}

function deletePublicDir(ctx) {
  const publicDir = ctx.public_dir;

  return fs.exists(publicDir).then(exist => {
    if (!exist) return;

    return fs.rmdir(publicDir).then(() => {
      ctx.log.info('Deleted public folder.');
    });
  });
}

module.exports = cleanConsole;
