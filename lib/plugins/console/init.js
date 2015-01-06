var pathFn = require('path');
var tildify = require('tildify');
var fs = require('hexo-fs');
var chalk = require('chalk');

function initConsole(args){
  var baseDir = this.base_dir;
  var log = this.log;
  var assetDir = pathFn.join(this.core_dir, 'assets');
  var target = args._[0] ? pathFn.resolve(baseDir, args._[0]) : baseDir;

  log.info('Copying data to %s', chalk.magenta(tildify(target)));

  return fs.copyDir(assetDir, target).then(function(){
    return fs.rename(
      pathFn.join(target, 'gitignore'),
      pathFn.join(target, '.gitignore'));
  }).then(function(){
    log.info('You are almost done! Don\'t forget to run `npm install` ' +
      'before you start blogging with Hexo!');
  });
}

module.exports = initConsole;