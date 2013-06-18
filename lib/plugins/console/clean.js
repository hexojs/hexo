var fs = require('graceful-fs'),
  extend = require('../../extend'),
  log = hexo.log;

extend.console.register('clean', 'Clean cache', function(args, callback){
  var path = hexo.base_dir + 'db.json';

  fs.exists(path, function(exist){
    if (!exist){
      log.w('Cache not exists');
      return callback();
    }

    log.i('Cleaning cache...');
    fs.unlink(path, function(err){
      if (err) return callback(err);

      log.i('Cache cleaned!');
    });
  });
});