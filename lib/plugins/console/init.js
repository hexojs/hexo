var pathFn = require('path');
var tildify = require('tildify');
var util = require('../../util');
var fs = util.fs;

require('colors');

module.exports = function(args){
  var baseDir = this.base_dir;
  var log = this.log;
  var assetDir = pathFn.join(this.core_dir, 'assets');
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