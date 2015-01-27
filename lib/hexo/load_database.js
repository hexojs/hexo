'use strict';

var fs = require('hexo-fs');
var Promise = require('bluebird');

module.exports = function(ctx){
  if (ctx._dbLoaded) return Promise.resolve();

  var db = ctx.database;
  var path = db.options.path;
  var log = ctx.log;

  return fs.exists(path).then(function(exist){
    if (!exist) return;

    log.debug('Loading database.');
    return db.load();
  }).then(function(){
    ctx._dbLoaded = true;
  }, function(){
    log.error('Database load failed. Deleting database.');
    return fs.unlink(path);
  });
};