'use strict';

var Promise = require('bluebird');
var fs = require('hexo-fs');

function cleanConsole(args){
  /* jshint validthis: true */
  return Promise.all([
    deleteDatabase(this),
    deletePublicDir(this)
  ]);
}

function deleteDatabase(ctx){
  var dbPath = ctx.database.options.path;

  return fs.exists(dbPath).then(function(exist){
    if (!exist) return;

    return fs.unlink(dbPath).then(function(){
      ctx.log.info('Deleted database.');
    });
  });
}

function deletePublicDir(ctx){
  var publicDir = ctx.public_dir;

  return fs.exists(publicDir).then(function(exist){
    if (!exist) return;

    return fs.rmdir(publicDir).then(function(){
      ctx.log.info('Deleted public folder.');
    });
  });
}

module.exports = cleanConsole;