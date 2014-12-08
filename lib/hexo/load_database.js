var fs = require('hexo-fs');

module.exports = function(ctx){
  var db = ctx.database;
  var path = db.options.path;
  var log = ctx.log;

  return fs.exists(path).then(function(exist){
    if (!exist) return;

    log.debug('Loading database.');
    return db.load();
  }).catch(function(){
    log.error('Database load failed. Deleting database.');
    return fs.unlink(path);
  });
};