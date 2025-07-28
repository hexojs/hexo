import tildify from 'tildify';
import { magenta } from 'picocolors';
import type Hexo from '../../hexo/index.js';
import type Promise from 'bluebird';

interface PublishArgs {
  _: string[]
  r?: boolean
  replace?: boolean
  [key: string]: any
}

function publishConsole(this: Hexo, args: PublishArgs): Promise<void> {
  // Display help message if user didn't input any arguments
  if (!args._.length) {
    return this.call('help', {_: ['publish']});
  }

  return this.post.publish({
    slug: args._.pop(),
    layout: args._.length ? args._[0] : this.config.default_layout
  }, args.r || args.replace).then(post => {
    this.log.info('Published: %s', magenta(tildify(post.path)));
  });
}

export default publishConsole;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = publishConsole;
  module.exports.default = publishConsole;
}
