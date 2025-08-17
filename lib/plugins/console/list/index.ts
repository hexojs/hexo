import abbrev from 'abbrev';
import page from './page.js';
import post from './post.js';
import route from './route.js';
import tag from './tag.js';
import category from './category.js';
import type Hexo from '../../../hexo/index.js';
import type Promise from 'bluebird';

interface ListArgs {
  _: string[]
}

const store = {
  page, post, route, tag, category
};

const alias = abbrev(Object.keys(store));

function listConsole(this: Hexo, args: ListArgs): Promise<void> {
  const type = args._.shift();

  // Display help message if user didn't input any arguments
  if (!type || !alias[type]) {
    return this.call('help', {_: ['list']});
  }

  return this.load().then(() => Reflect.apply(store[alias[type]], this, [args]));
}

export default listConsole;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = listConsole;
  module.exports.default = listConsole;
}
