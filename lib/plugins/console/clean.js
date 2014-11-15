var Promise = require('bluebird');
var util = require('../../util');
var fs = util.fs;

module.exports = function(ctx){
  var log = ctx.log;
  var dbPath = ctx.database.options.path;

  function deleteDatabase(){
    return fs.exists(dbPath).then(function(exist){
      if (!exist) return;

      return fs.unlink(dbPath).then(function(){
        log.info('Deleted database.');
      });
    });
  }

  function deletePublicDir(){
    var publicDir = ctx.public_dir;

    return fs.exists(publicDir).then(function(exist){
      if (!exist) return;

      return fs.rmdir(publicDir).then(function(){
        log.info('Deleted public directory.');
      });
    });
  }

  return function(args){
    return Promise.all([
      deleteDatabase(),
      deletePublicDir()
    ]);
  };
};