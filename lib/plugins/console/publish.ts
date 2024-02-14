import tildify from 'tildify';
import { magenta } from 'picocolors';
import type Hexo from '../../hexo';

interface PublishArgs {
  _: string[]
  r?: boolean
  replace?: boolean
  [key: string]: any
}

function publishConsole(this: Hexo, args: PublishArgs) {
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

export = publishConsole;
