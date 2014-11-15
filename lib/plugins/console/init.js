var pathFn = require('path');
var tildify = require('tildify');
var util = require('../../util');
var fs = util.fs;

require('colors');

module.exports = function(ctx){
  var baseDir = ctx.base_dir;
  var log = ctx.log;
  var assetDir = pathFn.join(ctx.core_dir, 'assets');

  return function(args){
    var target = args._[0] ? pathFn.resolve(baseDir, args._[0]) : baseDir;

    log.info('Copying data to %s', tildify(target).magenta);

    return fs.copyDir(assetDir, target).then(function(){
      return fs.rename(
        pathFn.join(target, 'gitignore'),
        pathFn.join(target, '.gitignore'));
    }).then(function(){
      log.info('You are almost done! Don\'t forget to run `npm install` ' +
        'before you start blogging with Hexo!');
    });
  };
};