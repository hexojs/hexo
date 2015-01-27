'use strict';

var pathFn = require('path');
var tildify = require('tildify');
var prettyHrtime = require('pretty-hrtime');
var fs = require('hexo-fs');
var chalk = require('chalk');

function renderConsole(args){
  /* jshint validthis: true */
  // Display help message if user didn't input any arguments
  if (!args._.length){
    return this.call('help', {_: 'render'});
  }

  var baseDir = this.base_dir;
  var src = pathFn.resolve(baseDir, args._[0]);
  var output = args.o || args.output;
  var start = process.hrtime();
  var log = this.log;

  return this.render.render({
    path: src,
    engine: args.engine
  }).then(function(result){
    if (typeof result === 'object'){
      if (args.pretty){
        result = JSON.stringify(result, null, '  ');
      } else {
        result = JSON.stringify(result);
      }
    }

    if (!output) return console.log(result);

    var dest = pathFn.resolve(baseDir, output);
    var interval = prettyHrtime(process.hrtime(start));

    log.info('Rendered in %s: %s -> %s', chalk.cyan(interval), chalk.magenta(tildify(src)), chalk.magenta(tildify(dest)));
    return fs.writeFile(dest, result);
  });
}

module.exports = renderConsole;