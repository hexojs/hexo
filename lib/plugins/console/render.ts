import { resolve } from 'path';
import tildify from 'tildify';
import prettyHrtime from 'pretty-hrtime';
import { writeFile } from 'hexo-fs';
import { cyan, magenta } from 'picocolors';
import type Hexo from '../../hexo';

function renderConsole(this: Hexo, args) {
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
    return writeFile(dest, result);
  });
}

export = renderConsole;
