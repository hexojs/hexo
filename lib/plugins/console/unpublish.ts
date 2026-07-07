import tildify from 'tildify';
import { magenta } from 'picocolors';
import type Hexo from '../../hexo';
import type Promise from 'bluebird';

interface UnpublishArgs {
  _: string[]
  r?: boolean
  replace?: boolean
  [key: string]: any
}

function unpublishConsole(this: Hexo, args: UnpublishArgs): Promise<void> {
  // Display help message if user didn't input any arguments
  if (!args._.length) {
    return this.call('help', {_: ['unpublish']});
  }

  return this.post.unpublish({
    slug: args._.pop()
  }, args.r || args.replace).then(post => {
    this.log.info('Unpublished: %s', magenta(tildify(post.path)));
  });
}

export = unpublishConsole;
