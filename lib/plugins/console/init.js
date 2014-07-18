var pathFn = require('path'),
  async = require('async'),
  fs = require('graceful-fs'),
  util = require('../../util'),
  file = util.file2;

module.exports = function(args, callback){
  var target = hexo.base_dir,
    log = hexo.log;

  if (args._[0]) target = pathFn.resolve(target, args._[0]);

  log.i('Copying data');

  async.series([
    function(next){
      file.copyDir(pathFn.join(hexo.core_dir, 'assets'), target, next);
    },
    function(next){
      fs.rename(pathFn.join(target, 'gitignore'), pathFn.join(target, '.gitignore'), next);
    }
  ], function(err){
    if (err) return callback(err);

    log.i('You are almost done! Don\'t forget to run `npm install` before you start blogging with Hexo!');
    callback();
  });
};
