'use strict';

const { resolve } = require('path');
const tildify = require('tildify');
const prettyHrtime = require('pretty-hrtime');
const fs = require('hexo-fs');
const { cyan, magenta } = require('chalk');

function renderConsole(args) {
  // Display help message if user didn't input any arguments
  if (!args._.length) {
    return this.call('help', {_: 'render'});
  }

  const baseDir = this.base_dir;
  const src = resolve(baseDir, args._[0]);
  const output = args.o || args.output;
  const start = process.hrtime();
  const { log } = this;

  return this.render.render({
    path: src,
    engine: args.engine
  }).then(result => {
    if (typeof result === 'object') {
      if (args.pretty) {
        result = JSON.stringify(result, null, '  ');
      } else {
        result = JSON.stringify(result);
      }
    }

    if (!output) return console.log(result);

    const dest = resolve(baseDir, output);
    const interval = prettyHrtime(process.hrtime(start));

    log.info('Rendered in %s: %s -> %s', cyan(interval), magenta(tildify(src)), magenta(tildify(dest)));
    return fs.writeFile(dest, result);
  });
}

module.exports = renderConsole;
