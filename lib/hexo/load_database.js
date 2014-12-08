var semver = require('semver');
var fs = require('hexo-fs');

module.exports = function(ctx){
  var db = ctx.database;
  var path = db.options.path;
  var log = ctx.log;

  return fs.exists(path).then(function(exist){
    if (!exist) return;

    if (semver.lt(ctx.version, '3.0.0')){
      log.debug('Deleting old database.');
      return fs.unlink(path);
    } else {
      log.debug('Loading database.');
      return db.load();
    }
  }).catch(function(){
    log.error('Database log failed. Deleting database.');
    return fs.unlink(path);
  });
};